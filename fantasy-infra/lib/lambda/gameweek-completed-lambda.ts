import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import * as sns from '@aws-cdk/aws-sns';
import path = require('path');
import { propertyValidator } from '@aws-cdk/core';

export interface GameweekCompletedLambdaProps {
    leagueDetailsTable: ddb.Table
    gameweeksTable: ddb.Table
    badgeTable: ddb.Table
    gameweekPlayerHistoryTable: ddb.Table
    staticContentBucket: s3.Bucket
    errorTopic: sns.Topic
}
export class GameweekCompletedLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: GameweekCompletedLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: "fpl-service-controller.gameweekCompletedHandler",
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
        "GAMEWEEK_TABLE_NAME": props.gameweeksTable.tableName,
        "BADGE_TABLE_NAME": props.badgeTable.tableName,
        "GAMEWEEK_PLAYER_HISTORY_TABLE_NAME": props.gameweekPlayerHistoryTable.tableName,
        "STATIC_CONTENT_BUCKET_NAME": props.staticContentBucket.bucketName,
        "ERROR_TOPIC_ARN": props.errorTopic.topicArn
      },
      timeout: cdk.Duration.seconds(300),
      functionName: "GameweekCompletedLambda",
      description: "Processes a gameweek completion"
    });

    props.leagueDetailsTable.grantReadData(this);
    props.gameweeksTable.grantReadWriteData(this);
    props.badgeTable.grantReadWriteData(this);
    props.gameweekPlayerHistoryTable.grantWriteData(this);
    props.staticContentBucket.grantReadWrite(this);
    props.errorTopic.grantPublish(this);
  }
}
