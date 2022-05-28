import * as cdk from '@aws-cdk/core';
import * as stepFunctions from '@aws-cdk/aws-stepfunctions';
import * as stepFunctionTasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import * as cw from '@aws-cdk/aws-cloudwatch';
import * as cwActions from '@aws-cdk/aws-cloudwatch-actions';
import * as ec2 from '@aws-cdk/aws-ec2';
import { ExtractGameweekDataLambda } from '../lambda/extract-gameweek-data-lambda';
import { AssignGameweekBadgesLambda } from '../lambda/assign-gameweek-badges-lambda';
import { GameweekProcessingCompletedEmailLambda } from '../lambda/gameweek-processing-completed-email-lambda';
import { DataSourcesMap, DataSourceMapKeys } from '../data/data-stores';
import { ExtractFantasyTransactionsLambda } from '../lambda/extract-fantasy-transactions-lambda';
import { Duration } from '@aws-cdk/core';

export interface GameweekProcessingMachineProps {
    gameweekCompletedTopic: sns.Topic;
    leagueDetailsTable: ddb.Table;
    gameweeksTable: ddb.Table;
    badgeTable: ddb.Table;
    gameweekPlayerHistoryTable: ddb.Table;
    staticContentBucket: s3.Bucket;
    errorTopic: sns.Topic;
    mediaAssetsBucket: s3.Bucket;
    emailSubscriptionTable: ddb.Table;
    vpc: ec2.Vpc;
    dataSourcesMap: DataSourcesMap;
}
export class GameweekProcessingMachine extends cdk.Construct{

    extractGameweekDataLambda: lambda.Function;
    extractTransactionsLambda: lambda.Function;
    gameweekBadgeLambdas: lambda.Function[];
    gameweekProcessingCompletedEmailLambda: lambda.Function;
    gameweekProcessingStateMachine: stepFunctions.StateMachine;
    draftPicksLambda: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: GameweekProcessingMachineProps) {
        super(scope, id);
        this.createLambdas(props);

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

        const extractTransactionsTask = new stepFunctions.Task(this, "ExtractTransactionsTask", {
            task: new stepFunctionTasks.InvokeFunction(this.extractTransactionsLambda),
            timeout: cdk.Duration.minutes(5),
            comment: "Extracts and stores transactions for the league",
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

        const sendGameweekProcessingCompleteEmailTask = new stepFunctions.Task(this, "GameweekCompletedEmail", {
            task: new stepFunctionTasks.InvokeFunction(this.gameweekProcessingCompletedEmailLambda),
            timeout: cdk.Duration.minutes(5),
            comment: "Sends email notification of the gameweek processing completed",
            resultPath: stepFunctions.JsonPath.DISCARD
        });

        gameweekCompletedPublishTask.next(extractTransactionsTask);
        extractTransactionsTask.next(extractGameweekDataTask);
        extractGameweekDataTask.next(parallelGameweekBadgeProcessor);
        parallelGameweekBadgeProcessor.next(sendGameweekProcessingCompleteEmailTask);

        this.gameweekProcessingStateMachine = new stepFunctions.StateMachine(this, "GameweekProcessingStateMachine", {
            stateMachineName: "GameweekProcessingStateMachine",
            definition: gameweekCompletedPublishTask,
            stateMachineType: stepFunctions.StateMachineType.STANDARD,
            timeout: Duration.minutes(30)
        });

        const alarm = new cw.Alarm(this, 'GameweekProcessingStepFunctionFailureAlarm', {
            metric: this.gameweekProcessingStateMachine.metricFailed(),
            threshold: 1,
            evaluationPeriods: 1,
            datapointsToAlarm: 1,
            treatMissingData: cw.TreatMissingData.MISSING
        });
        alarm.addAlarmAction(new cwActions.SnsAction(props.errorTopic));
    }

    createLambdas(props: GameweekProcessingMachineProps): void {
        this.extractGameweekDataLambda = new ExtractGameweekDataLambda(this, "ExtractGameweekDataLambda", {
            gameweeksTable: props.gameweeksTable,
            leagueDetailsTable: props.leagueDetailsTable,
            badgeTable: props.badgeTable,
            gameweekPlayerHistoryTable: props.gameweekPlayerHistoryTable,
            staticContentBucket: props.staticContentBucket,
        });

        this.extractTransactionsLambda = new ExtractFantasyTransactionsLambda(this, "ExtractFantasyTransactionsLambda", {
            fantasyTransactionsTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.FANTASY_TRANSACTIONS_TABLE]
        });
    
        const gameweekBadgeMetadatas = [
            {
                functionName: "AssignGWPlayerStatBadgesV2",
                handler: "controller/gameweek-processing-controller.assignGameweekPlayerStatBadgesHandler",
                description: "Assigns badges based on player stats for the gameweek"
            },
            {
                functionName: "AssignGWMVPBadgeV2",
                handler: "controller/gameweek-processing-controller.assignGameweekMVPBadgeHandler",
                description: "Assigns badges based on MVP data for the gameweek"
            },
            {
                functionName: "AssignGWStandingsBadgesV2",
                handler: "controller/gameweek-processing-controller.assignGameweekStandingsBadgesHandler",
                description: "Assigns badges based on standings for the gameweek"
            }
        ];
        this.gameweekBadgeLambdas = [];
        for (let i in gameweekBadgeMetadatas) {
            let gameweekBadgeMetadata = gameweekBadgeMetadatas[i];
            let constructId = "GameweekAssignBadgeLambda" + i;
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

        this.gameweekProcessingCompletedEmailLambda = new GameweekProcessingCompletedEmailLambda(this, "GameweekCompletedEmailLambda", {
            gameweeksTable: props.gameweeksTable,
            leagueDetailsTable: props.leagueDetailsTable,
            badgeTable: props.badgeTable,
            gameweekPlayerHistoryTable: props.gameweekPlayerHistoryTable,
            staticContentBucket: props.staticContentBucket,
            functionName: "GameweekProcessingCompletedEmailLambdaV2",
            description: "Controller for email sent after gameweek processing has completed",
            handler: "controller/email-controller.sendGameweekProcessingCompletedEmailController",
            mediaAssetsBucket: props.mediaAssetsBucket,
            emailSubscriptionTable: props.emailSubscriptionTable
        });
    }

}
