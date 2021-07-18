import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface GetAllChampionsLambdaProps {
    leagueDetailsTable: ddb.Table
    badgeTable: ddb.Table
}
export class GetAllChampionsLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: GetAllChampionsLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/last-of-the-mohigans-controller.getAllChampions",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
        "BADGE_TABLE_NAME": props.badgeTable.tableName
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "GetAllChampionsLambda",
      description: "Gets all league champions objects"
    });

    props.leagueDetailsTable.grantReadData(this);
    props.badgeTable.grantReadData(this);
  }
}