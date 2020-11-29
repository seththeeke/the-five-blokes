import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import * as iam from '@aws-cdk/aws-iam';
import path = require('path');

export interface GameweekProcessingCompletedEmailLambdaProps {
    leagueDetailsTable: ddb.Table;
    gameweeksTable: ddb.Table;
    badgeTable: ddb.Table;
    gameweekPlayerHistoryTable: ddb.Table;
    staticContentBucket: s3.Bucket;
    handler: string;
    functionName: string;
    description: string;
}
export class GameweekProcessingCompletedEmailLambda extends lambda.Function {
  constructor(scope: cdk.Construct, id: string, props: GameweekProcessingCompletedEmailLambdaProps) {
    super(scope, id, {
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../backend-service')),
      handler: props.handler,
      runtime: lambda.Runtime.NODEJS_12_X,
      tracing: lambda.Tracing.ACTIVE,
      environment: {
        "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
        "GAMEWEEK_TABLE_NAME": props.gameweeksTable.tableName,
        "BADGE_TABLE_NAME": props.badgeTable.tableName,
        "GAMEWEEK_PLAYER_HISTORY_TABLE_NAME": props.gameweekPlayerHistoryTable.tableName,
        "STATIC_CONTENT_BUCKET_NAME": props.staticContentBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(300),
      functionName: props.functionName,
      description: props.description
    });

    props.leagueDetailsTable.grantReadData(this);
    props.gameweeksTable.grantReadData(this);
    props.badgeTable.grantReadData(this);
    props.gameweekPlayerHistoryTable.grantReadData(this);
    props.staticContentBucket.grantRead(this);

    const emailPolicyStatement = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
            "ses:SendEmail",
            "ses:SendRawEmail",
            "ses:SendTemplatedEmail",
            "ses:GetTemplate",
            "ses:ListTemplates"
        ],
        resources: [
            "*"
        ]
    });
    this.addToRolePolicy(emailPolicyStatement);
  }
}
