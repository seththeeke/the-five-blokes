import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import path = require('path');

export interface AssignDraftPicksBadgesLambdaProps {
    leagueDetailsTable: ddb.Table;
    badgeTable: ddb.Table;
    draftPicksTable: ddb.Table;
}
export class AssignDraftPicksBadgesLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: AssignDraftPicksBadgesLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "controller/season-processing-controller.assignDraftPicksAwardsHandler",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
        "BADGE_TABLE_NAME": props.badgeTable.tableName,
        "DRAFT_PICKS_TABLE_NAME": props.draftPicksTable.tableName,
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "AssignDraftPicksBadgesLambda",
      description: "Assigns badges related to draft picks"
    });

    props.leagueDetailsTable.grantReadData(this);
    props.draftPicksTable.grantReadWriteData(this);
    props.badgeTable.grantReadWriteData(this);
  }
}
