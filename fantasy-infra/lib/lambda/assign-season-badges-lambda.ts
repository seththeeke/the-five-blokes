import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ec2 from '@aws-cdk/aws-ec2';
import path = require('path');

export interface AssignSeasonBadgesLambdaProps {
    leagueDetailsTable: ddb.Table;
    gameweeksTable: ddb.Table;
    badgeTable: ddb.Table;
    gameweekPlayerHistoryTable: ddb.Table;
    staticContentBucket: s3.Bucket;
    transactionsTable: ddb.Table;
    vpc: ec2.Vpc;
    handler: string;
    functionName: string;
    description: string;
}
export class AssignSeasonBadgesLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: AssignSeasonBadgesLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      timeout: cdk.Duration.seconds(600),
      handler: props.handler,
      environment: {
        "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
        "GAMEWEEK_TABLE_NAME": props.gameweeksTable.tableName,
        "BADGE_TABLE_NAME": props.badgeTable.tableName,
        "GAMEWEEK_PLAYER_HISTORY_TABLE_NAME": props.gameweekPlayerHistoryTable.tableName,
        "STATIC_CONTENT_BUCKET_NAME": props.staticContentBucket.bucketName,
        "TRANSACTIONS_TABLE_NAME": props.transactionsTable.tableName
      },
      functionName: props.functionName,
      description: props.description,
      ...props
    });

    props.leagueDetailsTable.grantReadData(this);
    props.gameweeksTable.grantReadData(this);
    props.badgeTable.grantReadWriteData(this);
    props.gameweekPlayerHistoryTable.grantReadData(this);
    props.staticContentBucket.grantRead(this);
    props.transactionsTable.grantReadData(this);
  }
}
