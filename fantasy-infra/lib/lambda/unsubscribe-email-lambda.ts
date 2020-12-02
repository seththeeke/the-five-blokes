import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface UnSubscribeEmailLambdaProps {
    emailSubscriptionTable: ddb.Table
}
export class UnSubscribeEmailLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: UnSubscribeEmailLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/email-controller.unSubscribe",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "EMAIL_SUBSCRIPTION_TABLE": props.emailSubscriptionTable.tableName
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "UnSubscribeEmailLambda",
      description: "Unsubscribes an email address"
    });

    props.emailSubscriptionTable.grantReadWriteData(this);
  }
}
