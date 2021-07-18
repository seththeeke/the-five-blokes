import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as eventSource from '@aws-cdk/aws-lambda-event-sources';
import * as sns from '@aws-cdk/aws-sns';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import { AddNewLeagueLambda } from './lambda/add-new-league-lambda';
import { InitiateLeagueLambda } from './lambda/initiate-league-lambda';
import { StartingPosition } from '@aws-cdk/aws-lambda';
import { DataSources, DataSourceMapKeys } from './data/data-stores';

export class FantasyInfraStack extends cdk.Stack {

  vpc: ec2.Vpc;
  dataSources: DataSources;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'FantasyInfraVpc');

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
      },
      pointInTimeRecovery: true
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
      },
      pointInTimeRecovery: true
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
      },
      pointInTimeRecovery: true
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
      },
      pointInTimeRecovery: true
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

    // Global data sources so I don't have to pass individual databases and tables into sub-constructs
    this.dataSources = new DataSources(this, "FantasyInfraDataSources", {
      vpc: this.vpc,
      leagueDetailsTable,
      gameweeksTable,
      badgeTable,
      gameweekPlayerHistoryTable,
      staticContentBucket,
      mediaAssetsBucket,
      emailSubscriptionTable,
      gameweekCompletedTopic,
      seasonCompletedTopic,
      errorTopic
    });

    const addNewLeagueLambda = new AddNewLeagueLambda(this, "AddNewLeagueLambda", {
      leagueDetailsTable: this.dataSources.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE]
    });

    const initiateLeagueLambda = new InitiateLeagueLambda(this, "InitiateLeagueLambda", {
      leagueDetailsTable: this.dataSources.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE],
      badgeTable: this.dataSources.dataSourcesMap.ddbTables[DataSourceMapKeys.BADGE_TABLE]
    });
    const leagueDetailsStreamEventSource = new eventSource.DynamoEventSource(this.dataSources.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE], {
      startingPosition: StartingPosition.TRIM_HORIZON,
      batchSize: 1,
      retryAttempts: 5
    });
    leagueDetailsStreamEventSource.bind(initiateLeagueLambda);
  }
}
