import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface GetLatestGameweekLambdaProps {
    leagueDetailsTable: ddb.Table
    gameweeksTable: ddb.Table
}
export class GetLatestGameweekLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: GetLatestGameweekLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/last-of-the-mohigans-controller.getLatestGameweek",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
        "GAMEWEEK_TABLE_NAME": props.gameweeksTable.tableName,
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "GetLatestGameweekLambdaV2",
      description: "Gets the latest completed gameweek and details"
    });

    props.leagueDetailsTable.grantReadData(this);
    props.gameweeksTable.grantReadData(this);
  }
}
