import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as eventSource from '@aws-cdk/aws-lambda-event-sources';
import * as sns from '@aws-cdk/aws-sns';
import * as s3 from '@aws-cdk/aws-s3';
import { AddNewLeagueLambda } from './lambda/add-new-league-lambda';
import { InitiateLeagueLambda } from './lambda/initiate-league-lambda';
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { GameweekProcessingMachine } from './step-function/gameweek-processing-machine';
import { LastOfTheMohigansRestService } from './rest-service/last-of-the-mohigans-rest-service';
import { StatisticsApi } from './statistics-api/statistics-api';
import { FantasyLeagueStateMachine } from './step-function/fantasy-league-state-machine';

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
      readCapacity: 1,
      writeCapacity: 1,
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
      readCapacity: 1,
      writeCapacity: 1,
      stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
      sortKey: {
        name: "gameweek",
        type: ddb.AttributeType.NUMBER
      }
    });

    const emailSubscriptionTable = new ddb.Table(this, "EmailSubscriptionTable", {
      tableName: "EmailSubscriptions",
      partitionKey: {
        name: "emailAddress",
        type: ddb.AttributeType.STRING
      },
      readCapacity: 1,
      writeCapacity: 1,
      stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES
    });

    const staticContentBucket = new s3.Bucket(this, "StaticContentBucket");
    const mediaAssetsBucket = new s3.Bucket(this, "MediaAssetsBucket");

    const gameweekCompletedTopic = new sns.Topic(this, "GameweekCompletedTopic", {
      topicName: "GameweekCompletedTopic"
    });
    const seasonCompletedTopic = new sns.Topic(this, "SeasonCompletedTopic", {
      topicName: "SeasonCompletedTopic"
    });
    const errorTopic = new sns.Topic(this, "ErrorTopic", {
      topicName: "ErrorTopic"
    });

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

    new FantasyLeagueStateMachine(this, "GameweekProcessing", {
      gameweekCompletedTopic,
      seasonCompletedTopic,
      leagueDetailsTable,
      gameweeksTable,
      badgeTable,
      gameweekPlayerHistoryTable,
      staticContentBucket,
      errorTopic,
      mediaAssetsBucket,
      emailSubscriptionTable
    });

    const shouldUseDomainName = this.node.tryGetContext('shouldUseDomainName');
    new LastOfTheMohigansRestService(this, "LastOfTheMohigansRestService", {
      leagueDetailsTable,
      badgeTable,
      gameweeksTable,
      shouldUseDomainName,
      emailSubscriptionTable
    });

    new StatisticsApi(this, "StatisticsApi");
  }
}
