import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as cm from '@aws-cdk/aws-certificatemanager';
import * as r53 from '@aws-cdk/aws-route53';
import { GetAllParticipantsLambda } from '../lambda/get-all-participants-lambda';
import { GetLatestGameweekLambda } from '../lambda/get-latest-gameweek-lambda';
import { GetStandingsHistoryForLeagueLambda } from '../lambda/get-standings-history-for-league-lambda';
import { SubscribeEmailLambda } from '../lambda/subscribe-email-lambda';
import { UnSubscribeEmailLambda } from '../lambda/unsubscribe-email-lambda';
import { DataSourcesMap, DataSourceMapKeys } from '../data/data-stores';
import { GetAllLeagueDetailsLambda } from '../lambda/get-all-league-details-lambda';

export interface LastOfTheMohigansRestServiceProps {
    shouldUseDomainName?: boolean;
    dataSourcesMap: DataSourcesMap;
}
export class LastOfTheMohigansRestService extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: LastOfTheMohigansRestServiceProps) {
    super(scope, id);
    const fantasyApiGateway = new apigateway.RestApi(this, "FantasyApiGateway", {
      restApiName: "FantasyApiGateway",
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["*"],
        allowHeaders: ["*"],
        allowCredentials: true
      }
    });
    if (props.shouldUseDomainName){
      const hostedZone = r53.HostedZone.fromHostedZoneAttributes(this, "DomainNameHostedZone", {
        zoneName: "api.lastofthemohigans.com",
        hostedZoneId: "Z047669429WYKBQJ48Z7U"
      });
      const domainNameCert = new cm.Certificate(this, "RestApiCertificate", {
        domainName: "api.lastofthemohigans.com",
        validation: cm.CertificateValidation.fromDns(hostedZone)
      });
      fantasyApiGateway.addDomainName("ApiGatewayDomainName", {
        certificate: domainNameCert,
        domainName: "api.lastofthemohigans.com"
      });
    }
    fantasyApiGateway.root.addMethod('ANY');
    const participantResource = fantasyApiGateway.root.addResource('participants');
    const gameweeksResource = fantasyApiGateway.root.addResource('gameweeks');
    const standingsResource = fantasyApiGateway.root.addResource('standings');
    const emailsResource = fantasyApiGateway.root.addResource('emails');
    const leagueDetailsResource = fantasyApiGateway.root.addResource('league-details');

    const getAllParticipantsLambda = new GetAllParticipantsLambda(this, "GetAllParticipantsLambda", {
        leagueDetailsTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE],
        badgeTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.BADGE_TABLE]
    });
    const getAllParticipantsLambdaIntegration = new apigateway.LambdaIntegration(getAllParticipantsLambda);
    participantResource.addMethod('GET', getAllParticipantsLambdaIntegration);

    const getLatestGameweekLambda = new GetLatestGameweekLambda(this, "GetLatestGameweekLambda", {
        leagueDetailsTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE],
        gameweeksTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.GAMEWEEKS_TABLE]
    });
    const getLatestGameweekLambdaIntegration = new apigateway.LambdaIntegration(getLatestGameweekLambda);
    gameweeksResource.addMethod('GET', getLatestGameweekLambdaIntegration);

    const getStandingsHistoryForLeagueLambda = new GetStandingsHistoryForLeagueLambda(this, "GetStandingsHistoryForLeagueLambda", {
        leagueDetailsTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE],
        gameweeksTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.GAMEWEEKS_TABLE]
    });
    const getStandingsHistoryForLeagueLambdaIntegration = new apigateway.LambdaIntegration(getStandingsHistoryForLeagueLambda);
    standingsResource.addMethod('GET', getStandingsHistoryForLeagueLambdaIntegration);

    const subscribeEmailLambda = new SubscribeEmailLambda(this, "SubscribeEmailLambda", {
      emailSubscriptionTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.EMAIL_SUBSCRIPTIONS_TABLE]
    });
    const subscribeEmailIntegration = new apigateway.LambdaIntegration(subscribeEmailLambda);
    emailsResource.addMethod('POST', subscribeEmailIntegration); 

    const unSubscribeEmailLambda = new UnSubscribeEmailLambda(this, "UnSubscribeEmailLambda", {
      emailSubscriptionTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.EMAIL_SUBSCRIPTIONS_TABLE]
    });
    const unSubscribeEmailIntegration = new apigateway.LambdaIntegration(unSubscribeEmailLambda);
    emailsResource.addMethod('DELETE', unSubscribeEmailIntegration);    

    const getAllLeagueDetailsLambda = new GetAllLeagueDetailsLambda(this, "GetAllLeagueDetailsLambda", {
      leagueDetailsTable: props.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE],
    });
    const getAllLeagueDetailsIntegration = new apigateway.LambdaIntegration(getAllLeagueDetailsLambda);
    leagueDetailsResource.addMethod('GET', getAllLeagueDetailsIntegration);
  }
}
