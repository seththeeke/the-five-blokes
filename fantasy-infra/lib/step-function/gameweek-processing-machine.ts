import * as cdk from '@aws-cdk/core';
import * as stepFunctions from '@aws-cdk/aws-stepfunctions';
import * as stepFunctionTasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as lambda from '@aws-cdk/aws-lambda';
import * as targets from '@aws-cdk/aws-events-targets';
import * as events from '@aws-cdk/aws-events';
import * as sns from '@aws-cdk/aws-sns';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import * as cw from '@aws-cdk/aws-cloudwatch';
import * as cwActions from '@aws-cdk/aws-cloudwatch-actions';
import { HasGameweekCompletedLambda } from '../lambda/has-gameweek-completed-lambda';
import { ExtractGameweekDataLambda } from '../lambda/extract-gameweek-data-lambda';
import { AssignGameweekBadgesLambda } from '../lambda/assign-gameweek-badges-lambda';

export interface GameweekProcessingMachineProps {
    gameweekCompletedTopic: sns.Topic;
    seasonCompletedTopic: sns.Topic;
    leagueDetailsTable: ddb.Table;
    gameweeksTable: ddb.Table;
    badgeTable: ddb.Table;
    gameweekPlayerHistoryTable: ddb.Table;
    staticContentBucket: s3.Bucket;
    errorTopic: sns.Topic;
}
export class GameweekProcessingMachine extends cdk.Construct{

    hasGameweekCompletedLambda: lambda.Function;
    extractGameweekDataLambda: lambda.Function;
    gameweekBadgeLambdas: lambda.Function[];

    constructor(scope: cdk.Construct, id: string, props: GameweekProcessingMachineProps) {
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
        
        const gameweekCompletedPublishTask = new stepFunctionTasks.SnsPublish(this, "GameweekCompletedNotification", {
            message: {
                type: stepFunctions.InputType.OBJECT,
                value: stepFunctions.TaskInput.fromDataAt("$")
            },
            topic: props.gameweekCompletedTopic,
            comment: "Publish notification of gameweek completed to gameweek completed topic",
            subject: "Gameweek Completed",
            resultPath: stepFunctions.JsonPath.DISCARD
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

        const extractGameweekDataTask = new stepFunctions.Task(this, "ExtractGameweekData", {
            task: new stepFunctionTasks.InvokeFunction(this.extractGameweekDataLambda),
            timeout: cdk.Duration.minutes(5),
            comment: "Extracts and stores data from FPL for processing"
        });

        const parallelGameweekBadgeProcessor = new stepFunctions.Parallel(this, "GameweekBadgeProcessors", {
            resultPath: stepFunctions.JsonPath.DISCARD
        });
        for (let i in this.gameweekBadgeLambdas) {
            let gameweekBadgeLambda = this.gameweekBadgeLambdas[i];
            let constructId = "Processor" + i;
            let stepFunctionTask = new stepFunctions.Task(this, constructId, {
                task: new stepFunctionTasks.InvokeFunction(gameweekBadgeLambda),
                timeout: cdk.Duration.minutes(10)
            });
            stepFunctionTask.addPrefix(gameweekBadgeLambda.functionName);
            parallelGameweekBadgeProcessor.branch(stepFunctionTask);
        }

        const hasSeasonCompletedChoice = new stepFunctions.Choice(this, "HasSeasonCompletedChoice", {
            comment: "Checks the gameweek value and if 38, begins season completed processing",
        });

        const seasonCompletedPublishTask = new stepFunctionTasks.SnsPublish(this, "SeasonCompletedNotification", {
            message: {
                type: stepFunctions.InputType.OBJECT,
                value: stepFunctions.TaskInput.fromDataAt("$")
            },
            topic: props.seasonCompletedTopic,
            comment: "Publish notification of season completed to season completed topic",
            subject: "Season Completed",
            resultPath: stepFunctions.JsonPath.DISCARD
        });

        hasGameweekCompletedTask.next(hasGameweekCompletedChoice);
        hasGameweekCompletedChoice.when(stepFunctions.Condition.booleanEquals("$.hasCompleted", true), gameweekCompletedPublishTask);
        hasGameweekCompletedChoice.when(stepFunctions.Condition.booleanEquals("$.hasCompleted", false), noGameweekDataPublishTask);
        gameweekCompletedPublishTask.next(extractGameweekDataTask);
        // Uncomment to make testing easier
        // noGameweekDataPublishTask.next(extractGameweekDataTask);
        extractGameweekDataTask.next(parallelGameweekBadgeProcessor);
        parallelGameweekBadgeProcessor.next(hasSeasonCompletedChoice);
        hasSeasonCompletedChoice.when(stepFunctions.Condition.stringEquals("$.gameweek", "38"), seasonCompletedPublishTask);
        hasSeasonCompletedChoice.when(stepFunctions.Condition.not(stepFunctions.Condition.stringEquals("$.gameweek", "38")), new stepFunctions.Succeed(this, "SeasonDidNotCompleteSoSkipToEnd"));

        const stateMachine = new stepFunctions.StateMachine(this, "GameweekProcessingStateMachine", {
            stateMachineName: "GameweekProcessingMachine",
            definition: hasGameweekCompletedTask,
            stateMachineType: stepFunctions.StateMachineType.STANDARD
        });

        const alarm = new cw.Alarm(this, 'StepFunctionFailureAlarm', {
            metric: stateMachine.metricFailed(),
            threshold: 1,
            evaluationPeriods: 1,
            datapointsToAlarm: 1,
            treatMissingData: cw.TreatMissingData.MISSING
        });
        alarm.addAlarmAction(new cwActions.SnsAction(props.errorTopic));

        const stateMachineTarget = new targets.SfnStateMachine(stateMachine);

        new events.Rule(this, "CloudWatchEventTrigger", {
            ruleName: "GameweekProcessingCloudWatchEventTrigger",
            schedule: events.Schedule.cron({
            minute: "0",
            hour: "14",
            day: "1/1"
            }),
            description: "CloudWatch rule to run daily to check if gameweek has completed",
            targets: [stateMachineTarget]
        });
    }

    createLambdas(props: GameweekProcessingMachineProps): void {

        this.hasGameweekCompletedLambda = new HasGameweekCompletedLambda(this, "HasGameweekCompletedLambda", {
            leagueDetailsTable: props.leagueDetailsTable,
            gameweeksTable: props.gameweeksTable,
        });
    
        this.extractGameweekDataLambda = new ExtractGameweekDataLambda(this, "ExtractGameweekDataLambda", {
            gameweeksTable: props.gameweeksTable,
            leagueDetailsTable: props.leagueDetailsTable,
            badgeTable: props.badgeTable,
            gameweekPlayerHistoryTable: props.gameweekPlayerHistoryTable,
            staticContentBucket: props.staticContentBucket,
        });
    
        const gameweekBadgeMetadatas = [
            {
                functionName: "AssignGWPlayerStatBadges",
                handler: "controller/gameweek-processing-controller.assignGameweekPlayerStatBadgesHandler",
                description: "Assigns badges based on player stats for the gameweek"
            },
            {
                functionName: "AssignGWMVPBadge",
                handler: "controller/gameweek-processing-controller.assignGameweekMVPBadgeHandler",
                description: "Assigns badges based on MVP data for the gameweek"
            },
            {
                functionName: "AssignGWStandingsBadges",
                handler: "controller/gameweek-processing-controller.assignGameweekStandingsBadgesHandler",
                description: "Assigns badges based on standings for the gameweek"
            }
        ];
        this.gameweekBadgeLambdas = [];
        for (let i in gameweekBadgeMetadatas) {
            let gameweekBadgeMetadata = gameweekBadgeMetadatas[i];
            let constructId = "AssignBadgeLambda" + i;
            this.gameweekBadgeLambdas.push(new AssignGameweekBadgesLambda(this, constructId, {
                gameweeksTable: props.gameweeksTable,
                leagueDetailsTable: props.leagueDetailsTable,
                badgeTable: props.badgeTable,
                gameweekPlayerHistoryTable: props.gameweekPlayerHistoryTable,
                staticContentBucket: props.staticContentBucket,
                functionName: gameweekBadgeMetadata.functionName,
                description: gameweekBadgeMetadata.description,
                handler: gameweekBadgeMetadata.handler
            }));
        }
    }
}
