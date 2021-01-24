import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { PremiereLeagueRDSDataLambda } from './premier-league-rds-data-lambda';

export interface ExtractSeasonDataLambdaProps {
    vpc: ec2.Vpc;
    plRDSCluster: rds.ServerlessCluster;
    leagueDetailsTable: ddb.Table;
    gameweeksTable: ddb.Table;
}
export class ExtractSeasonDataLambda extends PremiereLeagueRDSDataLambda {
  constructor(scope: cdk.Construct, id: string, props: ExtractSeasonDataLambdaProps) {
    super(scope, id, {
        handler: "controller/season-processing-controller.extractSeasonDataHandler",
        environmentVars: {
            "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
            "GAMEWEEK_TABLE_NAME": props.gameweeksTable.tableName,
        },
        functionName: "ExtractSeasonDataLambdaV2",
        description: "Extracts data for a Season",
        vpc: props.vpc,
        plRDSCluster: props.plRDSCluster
    });

    props.leagueDetailsTable.grantReadData(this);
    props.gameweeksTable.grantReadData(this);
  }
}
