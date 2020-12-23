import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sns from '@aws-cdk/aws-sns';
import path = require('path');

export interface TriggerGenerateStatisticsLambdaProps {
    generateStatisticsTopic: sns.Topic;
}
export class TriggerGenerateStatisticsLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: TriggerGenerateStatisticsLambdaProps) {
    super(scope, id, {
        code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
        functionName: "TriggerGenerateStatisticsLambda",
        description: "Controller for triggering the generation of statistics by publishing a message to an SNS Topic",
        handler: "controller/statistics-controller.triggerGenerateStatisticsController",
        environment: {
            "GENERATE_STATISTICS_TOPIC_ARN": props.generateStatisticsTopic.topicArn
        },
        runtime: lambda.Runtime.NODEJS_12_X,
        tracing: lambda.Tracing.ACTIVE,
        timeout: cdk.Duration.seconds(300),
    });

    props.generateStatisticsTopic.grantPublish(this);
  }
}
