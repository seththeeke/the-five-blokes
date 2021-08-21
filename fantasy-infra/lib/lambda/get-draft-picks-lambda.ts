import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface GetDraftPicksLambdaProps {
    draftPicksTable: ddb.Table
}
export class GetDraftPicksLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: GetDraftPicksLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/last-of-the-mohigans-controller.getDraftPicksForLeagueId",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "DRAFT_PICKS_TABLE_NAME": props.draftPicksTable.tableName
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "GetDraftPicksLambda",
      description: "Gets all draft picks for league id"
    });

    props.draftPicksTable.grantReadData(this);
  }
}
