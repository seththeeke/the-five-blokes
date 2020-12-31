import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import { PremiereLeagueRDSDataLambda, PremiereLeagueRDSDataLambdaProps } from './premier-league-rds-data-lambda';

export interface ExtractGameweekFixturesLambdaProps {
    leagueDetailsTable: ddb.Table;
    vpc: ec2.Vpc;
    plRDSCluster: rds.ServerlessCluster;
}
export class ExtractGameweekFixturesLambda extends PremiereLeagueRDSDataLambda {
  constructor(scope: cdk.Construct, id: string, props: ExtractGameweekFixturesLambdaProps) {
    super(scope, id, {
        vpc: props.vpc,
        plRDSCluster: props.plRDSCluster,
        handler: "controller/gameweek-processing-controller.extractGameweekFixturesHandler",
        description: "Extracts and stores all fixture data for a gameweek",
        functionName: "ExtractGameweekFixtures",
        environmentVars: {
            "LEAGUE_DETAILS_TABLE_NAME": props.leagueDetailsTable.tableName,
        },
    });

    props.leagueDetailsTable.grantReadData(this);
  }
}