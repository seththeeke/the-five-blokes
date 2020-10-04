import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface GetAllParticipantsLambdaProps {
    leagueDetailsTable: ddb.Table
    badgeTable: ddb.Table
}
export class GetAllParticipantsLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: GetAllParticipantsLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "fpl-service-controller.getAllParticipants",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
        "BADGE_TABLE_NAME": props.badgeTable.tableName
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "GetAllParticipantsLambda",
      description: "Gets all participants and their badges"
    });

    props.leagueDetailsTable.grantReadData(this);
    props.badgeTable.grantReadData(this);
  }
}
