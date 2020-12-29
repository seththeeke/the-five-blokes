import * as cdk from '@aws-cdk/core';
import * as stepFunctions from '@aws-cdk/aws-stepfunctions';
import * as stepFunctionTasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import * as cw from '@aws-cdk/aws-cloudwatch';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as cwActions from '@aws-cdk/aws-cloudwatch-actions';
import { AssignSeasonBadgesLambda } from '../lambda/assign-season-badges-lambda';
import { ExtractSeasonDataLambda } from '../lambda/extract-season-data-lambda';

export interface SeasonProcessingMachineProps {
    seasonCompletedTopic: sns.Topic;
    leagueDetailsTable: ddb.Table;
    gameweeksTable: ddb.Table;
    badgeTable: ddb.Table;
    gameweekPlayerHistoryTable: ddb.Table;
    staticContentBucket: s3.Bucket;
    errorTopic: sns.Topic;
    vpc: ec2.Vpc;
}
export class SeasonProcessingMachine extends cdk.Construct{

    extractSeasonDataLambda: lambda.Function;
    seasonBadgeLambdas: lambda.Function[];
    seasonProcessingStateMachine: stepFunctions.StateMachine;

    constructor(scope: cdk.Construct, id: string, props: SeasonProcessingMachineProps) {
        super(scope, id);
        this.createLambdas(props);

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

        const parallelSeasonBadgeProcessor = new stepFunctions.Parallel(this, "SeasonBadgeProcessors", {
            resultPath: stepFunctions.JsonPath.DISCARD
        });
        for (let i in this.seasonBadgeLambdas) {
            let seasonBadgeLambda = this.seasonBadgeLambdas[i];
            let constructId = "SeasonProcessor" + i;
            let stepFunctionTask = new stepFunctions.Task(this, constructId, {
                task: new stepFunctionTasks.InvokeFunction(seasonBadgeLambda),
                timeout: cdk.Duration.minutes(10)
            });
            stepFunctionTask.addPrefix(seasonBadgeLambda.functionName);
            parallelSeasonBadgeProcessor.branch(stepFunctionTask);
        }

        const extractSeasonDataTask = new stepFunctions.Task(this, "ExtractSeasonData", {
            task: new stepFunctionTasks.InvokeFunction(this.extractSeasonDataLambda),
            timeout: cdk.Duration.minutes(5),
            comment: "Extracts and stores data from FPL for processing season data"
        });

        seasonCompletedPublishTask.next(extractSeasonDataTask);
        extractSeasonDataTask.next(parallelSeasonBadgeProcessor);

        this.seasonProcessingStateMachine = new stepFunctions.StateMachine(this, "SeasonProcessingStateMachine", {
            stateMachineName: "SeasonProcessingStateMachine",
            definition: seasonCompletedPublishTask,
            stateMachineType: stepFunctions.StateMachineType.STANDARD
        });

        const alarm = new cw.Alarm(this, 'SeasonProcessingStepFunctionFailureAlarm', {
            metric: this.seasonProcessingStateMachine.metricFailed(),
            threshold: 1,
            evaluationPeriods: 1,
            datapointsToAlarm: 1,
            treatMissingData: cw.TreatMissingData.MISSING
        });
        alarm.addAlarmAction(new cwActions.SnsAction(props.errorTopic));
    }

    createLambdas(props: SeasonProcessingMachineProps): void {
        this.extractSeasonDataLambda = new ExtractSeasonDataLambda(this, "ExtractSeasonDataLambdaFunction", {
            vpc: props.vpc
        });
        const seasonBadgeMetadatas = [
            {
                functionName: "AssignLeagueAwardsBadgesV2",
                handler: "controller/season-processing-controller.assignLeagueAwardsHandler",
                description: "Assigns badges based on the league awards such as POTY and YPOTY"
            },
            {
                functionName: "AssignPlayerAwardsBadgesV2",
                handler: "controller/season-processing-controller.assignPlayerAwardsHandler",
                description: "Assigns badges based on awards such as golden glove, golden boot, etc for players"
            },
            {
                functionName: "AssignPlayerPointsAwardsBadgesV2",
                handler: "controller/season-processing-controller.assignPlayerPointsAwardsHandler",
                description: "Assigns badges based on the points earned by the players you own for the season"
            },
            {
                functionName: "AssignTeamPointsAwardsBadgesV2",
                handler: "controller/season-processing-controller.assignTeamPointsAwardsHandler",
                description: "Assigns badges based on points a team earns for the season"
            },
            {
                functionName: "AssignTeamStatisticsAwardsBadgesV2",
                handler: "controller/season-processing-controller.assignTeamStatisticsAwardsHandler",
                description: "Assigns badges based on the statistic for a team for the season like yellow and red cards, goals, assists, etc"
            },
            {
                functionName: "AssignTransactionsAwardsBadgesV2",
                handler: "controller/season-processing-controller.assignTransactionsAwardsHandler",
                description: "Assigns badges based on transaction data for the season"
            }
        ];

        this.seasonBadgeLambdas = [];
        for (let i in seasonBadgeMetadatas) {
            let seasonBadgeMetadata = seasonBadgeMetadatas[i];
            let constructId = "SeasonAssignBadgeLambda" + i;
            this.seasonBadgeLambdas.push(new AssignSeasonBadgesLambda(this, constructId, {
                gameweeksTable: props.gameweeksTable,
                leagueDetailsTable: props.leagueDetailsTable,
                badgeTable: props.badgeTable,
                gameweekPlayerHistoryTable: props.gameweekPlayerHistoryTable,
                staticContentBucket: props.staticContentBucket,
                functionName: seasonBadgeMetadata.functionName,
                description: seasonBadgeMetadata.description,
                handler: seasonBadgeMetadata.handler
            }));
        }
    }
}
