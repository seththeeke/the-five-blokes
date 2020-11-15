import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as ddb from '@aws-cdk/aws-dynamodb';
import { GetAllParticipantsLambda } from '../lambda/get-all-participants-lambda';
import { GetLatestGameweekLambda } from '../lambda/get-latest-gameweek-lambda';
import { GetStandingsHistoryForLeagueLambda } from '../lambda/get-standings-history-for-league-lambda';

export interface LastOfTheMohigansRestServiceProps {
    leagueDetailsTable: ddb.Table;
    badgeTable: ddb.Table;
    gameweeksTable: ddb.Table;
}
export class LastOfTheMohigansRestService extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: LastOfTheMohigansRestServiceProps) {
    super(scope, id);
    const fantasyApiGateway = new apigateway.RestApi(this, "FantasyApiGateway", {
      restApiName: "FantasyApiGateway"
    });
    fantasyApiGateway.root.addMethod('ANY');
    const participantResource = fantasyApiGateway.root.addResource('participants');
    const gameweeksResource = fantasyApiGateway.root.addResource('gameweeks');
    const standingsResource = fantasyApiGateway.root.addResource('standings');

    const getAllParticipantsLambda = new GetAllParticipantsLambda(this, "GetAllParticipantsLambda", {
        leagueDetailsTable: props.leagueDetailsTable,
        badgeTable: props.badgeTable
    });
    const getAllParticipantsLambdaIntegration = new apigateway.LambdaIntegration(getAllParticipantsLambda);
    participantResource.addMethod('GET', getAllParticipantsLambdaIntegration);

    const getLatestGameweekLambda = new GetLatestGameweekLambda(this, "GetLatestGameweekLambda", {
        leagueDetailsTable: props.leagueDetailsTable,
        gameweeksTable: props.gameweeksTable
    });
    const getLatestGameweekLambdaIntegration = new apigateway.LambdaIntegration(getLatestGameweekLambda);
    gameweeksResource.addMethod('GET', getLatestGameweekLambdaIntegration);

    const getStandingsHistoryForLeagueLambda = new GetStandingsHistoryForLeagueLambda(this, "GetStandingsHistoryForLeagueLambda", {
        leagueDetailsTable: props.leagueDetailsTable,
        gameweeksTable: props.gameweeksTable
    });
    const getStandingsHistoryForLeagueLambdaIntegration = new apigateway.LambdaIntegration(getStandingsHistoryForLeagueLambda);
    standingsResource.addMethod('GET', getStandingsHistoryForLeagueLambdaIntegration);
  }
}
