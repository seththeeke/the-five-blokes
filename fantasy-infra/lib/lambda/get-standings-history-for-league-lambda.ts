import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface GetStandingsHistoryForLeagueLambdaProps {
    leagueDetailsTable: ddb.Table
    gameweeksTable: ddb.Table
}
export class GetStandingsHistoryForLeagueLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: GetStandingsHistoryForLeagueLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/last-of-the-mohigans-controller.getStandingsHistoryForActiveLeague",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
        "GAMEWEEK_TABLE_NAME": props.gameweeksTable.tableName,
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "GetStandingsHistoryForLeagueLambda",
      description: "Gets the full standings history for the active league"
    });

    props.leagueDetailsTable.grantReadData(this);
    props.gameweeksTable.grantReadData(this);
  }
}
