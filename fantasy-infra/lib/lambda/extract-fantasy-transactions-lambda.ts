import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface ExtractFantasyTransactionsLambdaProps {
    fantasyTransactionsTable: ddb.Table
}
export class ExtractFantasyTransactionsLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: ExtractFantasyTransactionsLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/gameweek-processing-controller.extractTransactionsHandler",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "TRANSACTIONS_TABLE_NAME": props.fantasyTransactionsTable.tableName
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "ExtractFantasyTransactionsLambda",
      description: "Extracts transactions for the fantasy league"
    });

    props.fantasyTransactionsTable.grantReadWriteData(this);
  }
}
