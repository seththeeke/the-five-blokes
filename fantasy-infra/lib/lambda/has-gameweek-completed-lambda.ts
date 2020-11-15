import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as sns from '@aws-cdk/aws-sns';
import path = require('path');

export interface HasGameweekCompletedLambdaProps {
    leagueDetailsTable: ddb.Table
    gameweeksTable: ddb.Table
}
export class HasGameweekCompletedLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: HasGameweekCompletedLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/gameweek-processing-controller.hasGameweekCompleted",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
        "GAMEWEEK_TABLE_NAME": props.gameweeksTable.tableName,
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "HasGameweekCompletedLambdaV2",
      description: "Checks if the gameweek has completed, and if so, returns json representing the gameweek and true or false as to whether the gameweek has completed"
    });

    props.leagueDetailsTable.grantReadData(this);
    props.gameweeksTable.grantReadData(this);
  }
}
