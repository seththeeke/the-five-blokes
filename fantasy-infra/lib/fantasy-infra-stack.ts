import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as eventSource from '@aws-cdk/aws-lambda-event-sources';
import * as sns from '@aws-cdk/aws-sns';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as targets from '@aws-cdk/aws-events-targets';
import * as events from '@aws-cdk/aws-events';
import * as s3 from '@aws-cdk/aws-s3';
import { AddNewLeagueLambda } from './lambda/add-new-league-lambda';
import { InitiateLeagueLambda } from './lambda/initiate-league-lambda';
import { HasGameweekCompletedLambda } from './lambda/has-gameweek-completed-lambda';
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { GameweekCompletedLambda } from './lambda/gameweek-completed-lambda';
import { AuthenticatedRequestLambda } from './lambda/authenticated-request-lambda';
import { GetAllParticipantsLambda } from './lambda/get-all-participants-lambda';
import { GetLatestGameweekLambda } from './lambda/get-latest-gameweek-lambda';
import { GetStandingsHistoryForLeagueLambda } from './lambda/get-standings-history-for-league-lambda';
import { GameweekProcessingMachine } from './step-function/gameweek-processing-machine';

export class FantasyInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const leagueDetailsTable = new ddb.Table(this, "LeagueDetails", {
      tableName: "LeagueDetails",
      partitionKey: {
        name: "leagueId",
        type: ddb.AttributeType.STRING
      },
      readCapacity: 1,
      writeCapacity: 1,
      stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
      sortKey: {
        name: "year",
        type: ddb.AttributeType.STRING
      }
    });

    const badgeTable = new ddb.Table(this, "FantasyBadges", {
      tableName: "FantasyBadges",
      partitionKey: {
        name: "id",
        type: ddb.AttributeType.STRING
      },
      readCapacity: 1,
      writeCapacity: 1,
      stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
      sortKey: {
        name: "participantId",
        type: ddb.AttributeType.STRING
      }
    });

    const gameweeksTable = new ddb.Table(this, "Gameweeks", {
      tableName: "Gameweeks",
      partitionKey: {
        name: "leagueId",
        type: ddb.AttributeType.STRING
      },
      readCapacity: 0,
      writeCapacity: 0,
      stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
      sortKey: {
        name: "gameweek",
        type: ddb.AttributeType.NUMBER
      }
    });

    const gameweekPlayerHistoryTable = new ddb.Table(this, "GameweekPlayerHistory", {
      tableName: "GameweekPlayerHistory",
      partitionKey: {
        name: "leagueIdTeamId",
        type: ddb.AttributeType.STRING
      },
      readCapacity: 0,
      writeCapacity: 0,
      stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
      sortKey: {
        name: "gameweek",
        type: ddb.AttributeType.NUMBER
      }
    });

    const staticContentBucket = new s3.Bucket(this, "StaticContentBucket");

    const gameweekCompletedTopic = new sns.Topic(this, "GameweekCompletedTopic", {
      topicName: "GameweekCompletedTopic"
    });
    const seasonCompletedTopic = new sns.Topic(this, "SeasonCompletedTopic", {
      topicName: "SeasonCompletedTopic"
    });
    const errorTopic = new sns.Topic(this, "ErrorTopic", {
      topicName: "ErrorTopic"
    });

    const fantasyApiGateway = new apigateway.RestApi(this, "FantasyApiGateway", {
      restApiName: "FantasyApiGateway"
    });
    fantasyApiGateway.root.addMethod('ANY');
    const participantResource = fantasyApiGateway.root.addResource('participants');
    const gameweeksResource = fantasyApiGateway.root.addResource('gameweeks');
    const standingsResource = fantasyApiGateway.root.addResource('standings');

    const addNewLeagueLambda = new AddNewLeagueLambda(this, "AddNewLeagueLambda", {
      leagueDetailsTable
    });

    const initiateLeagueLambda = new InitiateLeagueLambda(this, "InitiateLeagueLambda", {
      leagueDetailsTable,
      badgeTable
    });
    const leagueDetailsStreamEventSource = new eventSource.DynamoEventSource(leagueDetailsTable, {
      startingPosition: StartingPosition.TRIM_HORIZON,
      batchSize: 1,
      retryAttempts: 5
    });
    leagueDetailsStreamEventSource.bind(initiateLeagueLambda);

    const hasGameweekCompletedLambda = new HasGameweekCompletedLambda(this, "HasGameweekCompletedLambda", {
      leagueDetailsTable,
      gameweekCompletedTopic,
      gameweeksTable, 
      seasonCompletedTopic,
      errorTopic
    });
    const hasGameweekCompletedTarget = new targets.LambdaFunction(hasGameweekCompletedLambda);
    new events.Rule(this, "CloudWatchEventTrigger", {
      ruleName: "HasGameweekCompletedTrigger",
      schedule: events.Schedule.cron({
        minute: "0",
        hour: "14",
        day: "1/1"
      }),
      description: "CloudWatch rule to run daily to check if the gameweek has completed",
      targets: [hasGameweekCompletedTarget]
    });

    const gameweekCompletedLambda = new GameweekCompletedLambda(this, "GameweekCompletedLambda", {
      gameweeksTable,
      leagueDetailsTable,
      badgeTable,
      gameweekPlayerHistoryTable,
      staticContentBucket,
      errorTopic
    });
    const snsSubscription = new eventSource.SnsEventSource(gameweekCompletedTopic);
    snsSubscription.bind(gameweekCompletedLambda);

    const getAllParticipantsLambda = new GetAllParticipantsLambda(this, "GetAllParticipantsLambda", {
      leagueDetailsTable,
      badgeTable
    });
    const getAllParticipantsLambdaIntegration = new apigateway.LambdaIntegration(getAllParticipantsLambda);
    participantResource.addMethod('GET', getAllParticipantsLambdaIntegration);

    const getLatestGameweekLambda = new GetLatestGameweekLambda(this, "GetLatestGameweekLambda", {
      leagueDetailsTable,
      gameweeksTable
    });
    const getLatestGameweekLambdaIntegration = new apigateway.LambdaIntegration(getLatestGameweekLambda);
    gameweeksResource.addMethod('GET', getLatestGameweekLambdaIntegration);

    const getStandingsHistoryForLeagueLambda = new GetStandingsHistoryForLeagueLambda(this, "GetStandingsHistoryForLeagueLambda", {
      leagueDetailsTable,
      gameweeksTable
    });
    const getStandingsHistoryForLeagueLambdaIntegration = new apigateway.LambdaIntegration(getStandingsHistoryForLeagueLambda);
    standingsResource.addMethod('GET', getStandingsHistoryForLeagueLambdaIntegration);


    // New Gameweek Processing State Machine
    new GameweekProcessingMachine(this, "GameweekProcessing", {
      hasGameweekCompletedLambda
    });
  }
}
