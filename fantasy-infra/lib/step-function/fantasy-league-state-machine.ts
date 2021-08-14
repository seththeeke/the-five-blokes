import * as cdk from '@aws-cdk/core';
import * as stepFunctions from '@aws-cdk/aws-stepfunctions';
import * as stepFunctionTasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as lambda from '@aws-cdk/aws-lambda';
import * as targets from '@aws-cdk/aws-events-targets';
import * as events from '@aws-cdk/aws-events';
import * as sns from '@aws-cdk/aws-sns';
import * as cw from '@aws-cdk/aws-cloudwatch';
import * as cwActions from '@aws-cdk/aws-cloudwatch-actions';
import * as ec2 from '@aws-cdk/aws-ec2';
import { HasGameweekCompletedLambda } from '../lambda/has-gameweek-completed-lambda';
import { SeasonProcessingMachine } from './season-processing-machine';
import { GameweekProcessingMachine } from './gameweek-processing-machine';
import { DataSourcesMap, DataSourceMapKeys } from '../data/data-stores';
import { PremiereLeagueRDSDataLambda } from '../lambda/premier-league-rds-data-lambda';
import { Result, JsonPath, IntegrationPattern } from '@aws-cdk/aws-stepfunctions';
import { SeasonStartProcessingStateMachine } from './season-start-processing-state-machine';

export interface FantasyLeagueStateMachineProps {
    gameweekCompletedTopic: sns.Topic;
    seasonCompletedTopic: sns.Topic;
    errorTopic: sns.Topic;
    dataSourcesMap: DataSourcesMap;
    vpc: ec2.Vpc;
}
export class FantasyLeagueStateMachine extends cdk.Construct{

    hasGameweekCompletedLambda: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: FantasyLeagueStateMachineProps) {
        super(scope, id);
        this.createLambdas(props);

        const noGameweekDataTopic = new sns.Topic(this, "NoGameweekUpdate", {
            topicName: "NoGameweekDataTopic"
        });

        const hasGameweekCompletedTask = new stepFunctions.Task(this, "HasGameweekCompletedPoller", {
            task: new stepFunctionTasks.InvokeFunction(this.hasGameweekCompletedLambda),
            timeout: cdk.Duration.minutes(3),
            comment: "Checks if the gameweek has completed"
        });

        const hasGameweekCompletedChoice = new stepFunctions.Choice(this, "HasGameweekCompletedChoice", {
            comment: "Checks the hasCompleted flag and if true, sends the state machine towards ETL process"
        });

        const hasSeasonStartedChoice = new stepFunctions.Choice(this, "HasSeasonStartedChoice", {
            comment: "Checks gameweek and returns true if the gameweek is 1, false otherwise"
        });
        
        const noGameweekDataPublishTask = new stepFunctionTasks.SnsPublish(this, "NoGameweekDataTask", {
            message: {
                type: stepFunctions.InputType.OBJECT,
                value: stepFunctions.TaskInput.fromDataAt("$")
            },
            topic: noGameweekDataTopic,
            comment: "Publish notification that there is no gameweek data",
            subject: "No Gameweek Data",
            resultPath: stepFunctions.JsonPath.DISCARD
        });

        const seasonStartProcessingStateMachine = new SeasonStartProcessingStateMachine(this, "SeasonStartProcessingStateMachine", {
            errorTopic: props.errorTopic,
            dataSourcesMap: props.dataSourcesMap
        });

        const gameweekCompletedStateMachine = new GameweekProcessingMachine(this, "GameweekProcessingStateMachine", {
            badgeTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.BADGE_TABLE],
            emailSubscriptionTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.EMAIL_SUBSCRIPTIONS_TABLE],
            errorTopic: props.errorTopic,
            gameweekCompletedTopic: props.gameweekCompletedTopic,
            gameweekPlayerHistoryTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.GAMEWEEK_PLAYER_HISTORY_TABLE],
            gameweeksTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.GAMEWEEKS_TABLE],
            leagueDetailsTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE],
            mediaAssetsBucket: props.dataSourcesMap.s3Buckets[DataSourceMapKeys.MEDIA_ASSET_BUCKET],
            staticContentBucket: props.dataSourcesMap.s3Buckets[DataSourceMapKeys.STATIC_CONTENT_BUCKET],
            dataSourcesMap: props.dataSourcesMap,
            vpc: props.vpc
        });

        const hasSeasonCompletedChoice = new stepFunctions.Choice(this, "HasSeasonCompletedChoice", {
            comment: "Checks the gameweek value and if 38, begins season completed processing",
        });

        const seasonCompletedStateMachine = new SeasonProcessingMachine(this, "SeasonProcessingMachine", {
            badgeTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.BADGE_TABLE],
            errorTopic: props.errorTopic,
            gameweekPlayerHistoryTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.GAMEWEEK_PLAYER_HISTORY_TABLE],
            gameweeksTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.GAMEWEEKS_TABLE], 
            leagueDetailsTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE],
            seasonCompletedTopic: props.seasonCompletedTopic,
            staticContentBucket: props.dataSourcesMap.s3Buckets[DataSourceMapKeys.STATIC_CONTENT_BUCKET],
            vpc: props.vpc,
            dataSourcesMap: props.dataSourcesMap,
            mediaAssetsBucket: props.dataSourcesMap.s3Buckets[DataSourceMapKeys.MEDIA_ASSET_BUCKET],
            emailSubscriptionTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.EMAIL_SUBSCRIPTIONS_TABLE]
        });

        hasGameweekCompletedTask.next(hasGameweekCompletedChoice);

        // I need to warm the serverless RDS cluster because the mysql2 library is timing out regularly when the cluster is scaling up
        // I do not want to use the RDS Data API for nodejs because it is slow and returns data in a completely unreadable way
        const RDSWarmingLambda = new PremiereLeagueRDSDataLambda(this, "RDSWarmingLambda", {
            functionName: "RDSWarmingLambda",
            plRDSCluster: props.dataSourcesMap.rdsClusters[DataSourceMapKeys.PREMIER_LEAGUE_RDS_CLUSTER],
            vpc: props.vpc,
            description: "Lambda for warming the RDS Cluster to remove timeouts when connecting using mysql2",
            handler: "controller/warming-controller.warmRDSCluster"
        });
        const rdsWarmingTask = new stepFunctions.Task(this, "RDSWarmingTask", {
            task: new stepFunctionTasks.InvokeFunction(RDSWarmingLambda),
            timeout: cdk.Duration.minutes(3),
            comment: "Warms RDS in prep for data extraction",
            resultPath: JsonPath.DISCARD
        });

        const seasonStartProcessingStateMachineExecution = new stepFunctionTasks.StepFunctionsStartExecution(this, "SeasonStartProcessingStateMachineTask", {
            stateMachine: seasonStartProcessingStateMachine.seasonStartProcessingStateMachine,
            resultPath: stepFunctions.JsonPath.DISCARD,
            integrationPattern: IntegrationPattern.RUN_JOB
        });

        const gameweekProcessingStateMachineExecution = new stepFunctionTasks.StepFunctionsStartExecution(this, "GameweekProcessingStateMachineTask", {
            stateMachine: gameweekCompletedStateMachine.gameweekProcessingStateMachine,
            resultPath: stepFunctions.JsonPath.DISCARD,
            integrationPattern: IntegrationPattern.RUN_JOB
        });
        hasGameweekCompletedChoice.when(stepFunctions.Condition.booleanEquals("$.hasCompleted", true), rdsWarmingTask);
        hasGameweekCompletedChoice.when(stepFunctions.Condition.booleanEquals("$.hasCompleted", false), noGameweekDataPublishTask);

        rdsWarmingTask.next(hasSeasonStartedChoice);
        hasSeasonStartedChoice.when(stepFunctions.Condition.stringEquals("$.gameweek", "1"), seasonStartProcessingStateMachineExecution);
        hasSeasonStartedChoice.when(stepFunctions.Condition.not(stepFunctions.Condition.stringEquals("$.gameweek", "1")), gameweekProcessingStateMachineExecution);
        seasonStartProcessingStateMachineExecution.next(gameweekProcessingStateMachineExecution);
        
        gameweekProcessingStateMachineExecution.next(hasSeasonCompletedChoice);
        const hasSeasonCompletedCondition = stepFunctions.Condition.or(
            stepFunctions.Condition.stringEquals("$.gameweek", "38"),
            stepFunctions.Condition.booleanEquals("$.shouldOverrideSeasonCompletedChoice", true));
        const seasonProcessingStateMachineExecution = new stepFunctionTasks.StepFunctionsStartExecution(this, "SeasonProcessingStateMachineTask", {
            stateMachine: seasonCompletedStateMachine.seasonProcessingStateMachine,
            integrationPattern: IntegrationPattern.RUN_JOB
        });
        hasSeasonCompletedChoice.when(hasSeasonCompletedCondition, seasonProcessingStateMachineExecution);
        hasSeasonCompletedChoice.when(stepFunctions.Condition.not(hasSeasonCompletedCondition), new stepFunctions.Succeed(this, "SeasonDidNotCompleteSoSkipToEnd"));

        const stateMachine = new stepFunctions.StateMachine(this, "FantasyLeagueProcessingStateMachine", {
            stateMachineName: "FantasyLeagueProcessingStateMachine",
            definition: hasGameweekCompletedTask,
            stateMachineType: stepFunctions.StateMachineType.STANDARD,
            timeout: cdk.Duration.minutes(60)
        });

        const alarm = new cw.Alarm(this, 'FantasyLeagueStepFunctionFailureAlarm', {
            metric: stateMachine.metricFailed(),
            threshold: 1,
            evaluationPeriods: 1,
            datapointsToAlarm: 1,
            treatMissingData: cw.TreatMissingData.MISSING
        });
        alarm.addAlarmAction(new cwActions.SnsAction(props.errorTopic));

        const stateMachineTarget = new targets.SfnStateMachine(stateMachine);

        new events.Rule(this, "CloudWatchEventTrigger", {
            ruleName: "FantasyLeagueProcessingCloudWatchEventTrigger",
            schedule: events.Schedule.cron({
            minute: "0",
            hour: "14",
            day: "1/1"
            }),
            description: "CloudWatch rule to run daily to check if gameweek has completed",
            targets: [stateMachineTarget]
        });
    }

    createLambdas(props: FantasyLeagueStateMachineProps): void {
        this.hasGameweekCompletedLambda = new HasGameweekCompletedLambda(this, "HasGameweekCompletedLambda", {
            leagueDetailsTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE],
            gameweeksTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.GAMEWEEKS_TABLE],
        });
    }
}
