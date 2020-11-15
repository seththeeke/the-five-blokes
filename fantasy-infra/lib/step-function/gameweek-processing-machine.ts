import * as cdk from '@aws-cdk/core';
import * as stepFunctions from '@aws-cdk/aws-stepfunctions';
import * as stepFunctionTasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as lambda from '@aws-cdk/aws-lambda';
import * as targets from '@aws-cdk/aws-events-targets';
import * as events from '@aws-cdk/aws-events';
import * as sns from '@aws-cdk/aws-sns';

export interface GameweekProcessingMachineProps {
    hasGameweekCompletedLambda: lambda.Function;
    gameweekCompletedTopic: sns.Topic;
    extractGameweekDataLambda: lambda.Function;
    gameweekBadgeLambdas: lambda.Function[];
    seasonCompletedTopic: sns.Topic;
}
export class GameweekProcessingMachine extends cdk.Construct{
  constructor(scope: cdk.Construct, id: string, props: GameweekProcessingMachineProps) {
    super(scope, id);

    const noGameweekDataTopic = new sns.Topic(this, "NoGameweekUpdate", {
        topicName: "NoGameweekDataTopic"
    });

    const hasGameweekCompletedTask = new stepFunctions.Task(this, "HasGameweekCompletedPoller", {
        task: new stepFunctionTasks.InvokeFunction(props.hasGameweekCompletedLambda),
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
        task: new stepFunctionTasks.InvokeFunction(props.extractGameweekDataLambda),
        timeout: cdk.Duration.minutes(5),
        comment: "Extracts and stores data from FPL for processing"
    });

    const parallelGameweekBadgeProcessor = new stepFunctions.Parallel(this, "GameweekBadgeProcessors", {
        resultPath: stepFunctions.JsonPath.DISCARD
    });
    for (let i in props.gameweekBadgeLambdas) {
        let gameweekBadgeLambda = props.gameweekBadgeLambdas[i];
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
    hasSeasonCompletedChoice.when(stepFunctions.Condition.not(stepFunctions.Condition.stringEquals("$.gameweek", "38")), new stepFunctions.Succeed(this, "SucceedMachine"));

    const stateMachine = new stepFunctions.StateMachine(this, "GameweekProcessingStateMachine", {
        stateMachineName: "GameweekProcessingMachine",
        definition: hasGameweekCompletedTask,
        stateMachineType: stepFunctions.StateMachineType.STANDARD
    });

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
}
