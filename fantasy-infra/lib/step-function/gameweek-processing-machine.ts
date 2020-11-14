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
}
export class GameweekProcessingMachine extends cdk.Construct{
  constructor(scope: cdk.Construct, id: string, props: GameweekProcessingMachineProps) {
    super(scope, id);

    const noGameweekDataTopic = new sns.Topic(this, "NoGameweekUpdate", {
        topicName: "NoGameweekDataTopic"
    });

    const hasGameweekCompletedTask = new stepFunctions.Task(this, "HasGameweekCompletedTask", {
        task: new stepFunctionTasks.InvokeFunction(props.hasGameweekCompletedLambda),
        timeout: cdk.Duration.minutes(3),
        comment: "Checks if the gameweek has completed"
    });

    const hasGameweekCompletedCheck = new stepFunctions.Choice(this, "hasGameweekCompletedChoice", {
        comment: "Checks the hasCompleted flag and if true, sends the state machine towards ETL process"
    });
    
    const gameweekCompletedPublishTask = new stepFunctionTasks.SnsPublish(this, "GameweekCompletedProcessingStarted", {
        message: {
            type: stepFunctions.InputType.OBJECT,
            value: stepFunctions.TaskInput.fromDataAt("$")
        },
        topic: props.gameweekCompletedTopic,
        comment: "Publish notification of gameweek completed to gameweek completed topic",
        subject: "Gameweek Completed"
    });

    const noGameweekDataPublishTask = new stepFunctionTasks.SnsPublish(this, "NoGameweekDataTask", {
        message: {
            type: stepFunctions.InputType.OBJECT,
            value: stepFunctions.TaskInput.fromDataAt("$")
        },
        topic: noGameweekDataTopic,
        comment: "Publish notification that there is no gameweek data",
        subject: "No Gameweek Data"
    });

    const dummyWaitState = new stepFunctions.Wait(this, "DummyWaitState", {
        time: stepFunctions.WaitTime.duration(cdk.Duration.seconds(5))
    });

    hasGameweekCompletedTask.next(hasGameweekCompletedCheck);
    hasGameweekCompletedCheck.when(stepFunctions.Condition.booleanEquals("$.hasCompleted", true), gameweekCompletedPublishTask);
    hasGameweekCompletedCheck.when(stepFunctions.Condition.booleanEquals("$.hasCompleted", false), noGameweekDataPublishTask);

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
