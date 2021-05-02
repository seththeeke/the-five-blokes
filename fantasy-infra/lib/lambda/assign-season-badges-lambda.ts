import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import { PremiereLeagueRDSDataLambda, PremiereLeagueRDSDataLambdaProps } from './premier-league-rds-data-lambda';

export interface AssignSeasonBadgesLambdaProps extends PremiereLeagueRDSDataLambdaProps {
    leagueDetailsTable: ddb.Table;
    gameweeksTable: ddb.Table;
    badgeTable: ddb.Table;
    gameweekPlayerHistoryTable: ddb.Table;
    staticContentBucket: s3.Bucket;
    handler: string;
    functionName: string;
    description: string;
    transactionsTable: ddb.Table;
}
export class AssignSeasonBadgesLambda extends PremiereLeagueRDSDataLambda {
  constructor(scope: cdk.Construct, id: string, props: AssignSeasonBadgesLambdaProps) {
    super(scope, id, {
      handler: props.handler,
      environmentVars: {
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
