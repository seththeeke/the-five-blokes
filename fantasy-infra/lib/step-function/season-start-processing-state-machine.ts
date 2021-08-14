import * as cdk from '@aws-cdk/core';
import * as stepFunctions from '@aws-cdk/aws-stepfunctions';
import * as stepFunctionTasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import * as cw from '@aws-cdk/aws-cloudwatch';
import * as cwActions from '@aws-cdk/aws-cloudwatch-actions';
import { DataSourcesMap, DataSourceMapKeys } from '../data/data-stores';
import { Duration } from '@aws-cdk/core';
import { ExtractDraftPicksLambda } from '../lambda/extract-draft-picks-lambda';

export interface SeasonStartProcessingStateMachineProps {
    dataSourcesMap: DataSourcesMap;
    errorTopic: sns.Topic;
}
export class SeasonStartProcessingStateMachine extends cdk.Construct{

    extractDraftPicksLambda: lambda.Function;
    seasonStartProcessingStateMachine: stepFunctions.StateMachine;

    constructor(scope: cdk.Construct, id: string, props: SeasonStartProcessingStateMachineProps) {
        super(scope, id);
        this.createLambdas(props);

        const extractDraftPicksTask = new stepFunctions.Task(this, "ExtractDraftPicks", {
            task: new stepFunctionTasks.InvokeFunction(this.extractDraftPicksLambda),
            timeout: cdk.Duration.minutes(20),
            comment: "Extracts and stores data the draft picks for the season",
            resultPath: stepFunctions.JsonPath.DISCARD
        });

        this.seasonStartProcessingStateMachine = new stepFunctions.StateMachine(this, "SeasonStartProcessingStateMachine", {
            stateMachineName: "SeasonStartProcessingStateMachine",
            definition: extractDraftPicksTask,
            stateMachineType: stepFunctions.StateMachineType.STANDARD,
            timeout: Duration.minutes(30)
        });

        const alarm = new cw.Alarm(this, 'GameweekProcessingStepFunctionFailureAlarm', {
            metric: this.seasonStartProcessingStateMachine.metricFailed(),
            threshold: 1,
            evaluationPeriods: 1,
            datapointsToAlarm: 1,
            treatMissingData: cw.TreatMissingData.MISSING
        });
        alarm.addAlarmAction(new cwActions.SnsAction(props.errorTopic));
    }

    createLambdas(props: SeasonStartProcessingStateMachineProps): void {
        this.extractDraftPicksLambda = new ExtractDraftPicksLambda(this, "ExtractDraftPicksLambda", {
            draftPicksTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.DRAFT_PICKS_TABLE]
        });
    }

}
