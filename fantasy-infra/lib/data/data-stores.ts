import * as cdk from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as s3 from '@aws-cdk/aws-s3';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import { RemovalPolicy } from '@aws-cdk/core';

export interface DataSourcesProps {
    vpc: ec2.Vpc;
    // These constructs should be defined in this construct at some point,
    //  but need to make sure it doesn't do any table teardown
    leagueDetailsTable: ddb.Table;
    gameweeksTable: ddb.Table;
    badgeTable: ddb.Table;
    gameweekPlayerHistoryTable: ddb.Table;
    staticContentBucket: s3.Bucket;
    mediaAssetsBucket: s3.Bucket;
    emailSubscriptionTable: ddb.Table;
}
export class DataSourcesMap {
    ddbTables: {
        [key: string]: ddb.Table;
    }
    s3Buckets: {
        [key: string]: s3.Bucket;
    }
    constructor(){
        this.ddbTables = {};
        this.s3Buckets = {};
    }
}
export const DataSourceMapKeys = {
    LEAGUE_DETAILS_TABLE: "LeagueDetails",
    BADGE_TABLE: "FantasyBadges",
    GAMEWEEKS_TABLE: "Gameweeks",
    GAMEWEEK_PLAYER_HISTORY_TABLE: "GameweekPlayerHistory",
    EMAIL_SUBSCRIPTIONS_TABLE: "EmailSubscriptions",
    STATIC_CONTENT_BUCKET: "StaticContentBucket",
    MEDIA_ASSET_BUCKET: "MediaAssetsBucket",
    FANTASY_TRANSACTIONS_TABLE: "FantasyTransactions",
    DRAFT_PICKS_TABLE: "DraftPicks",
    BLOG_POSTS_TABLE: "BlogPosts"
}
export class DataSources extends cdk.Construct {

    dataSourcesMap: DataSourcesMap;

    constructor(scope: cdk.Construct, id: string, props: DataSourcesProps) {
        super(scope, id);
        this.dataSourcesMap = new DataSourcesMap();
        this.dataSourcesMap.ddbTables[DataSourceMapKeys.LEAGUE_DETAILS_TABLE] = props.leagueDetailsTable;
        this.dataSourcesMap.ddbTables[DataSourceMapKeys.BADGE_TABLE] = props.badgeTable;
        this.dataSourcesMap.ddbTables[DataSourceMapKeys.GAMEWEEKS_TABLE] = props.gameweeksTable;
        this.dataSourcesMap.ddbTables[DataSourceMapKeys.GAMEWEEK_PLAYER_HISTORY_TABLE] = props.gameweekPlayerHistoryTable;
        this.dataSourcesMap.ddbTables[DataSourceMapKeys.EMAIL_SUBSCRIPTIONS_TABLE] = props.emailSubscriptionTable;
        this.dataSourcesMap.s3Buckets[DataSourceMapKeys.MEDIA_ASSET_BUCKET] = props.mediaAssetsBucket;
        this.dataSourcesMap.s3Buckets[DataSourceMapKeys.STATIC_CONTENT_BUCKET] = props.staticContentBucket;

        this.dataSourcesMap.ddbTables[DataSourceMapKeys.DRAFT_PICKS_TABLE] = new ddb.Table(this, "DraftPicksTable", {
            tableName: "DraftPicks",
            partitionKey: {
              name: "id",
              type: ddb.AttributeType.STRING
            },
            stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
            sortKey: {
              name: "league_id",
              type: ddb.AttributeType.STRING
            },
            pointInTimeRecovery: true,
            billingMode: ddb.BillingMode.PAY_PER_REQUEST
        });

        this.dataSourcesMap.ddbTables[DataSourceMapKeys.FANTASY_TRANSACTIONS_TABLE] = new ddb.Table(this, "FantasyTransactions", {
            tableName: "FantasyTransactions",
            partitionKey: {
              name: "id",
              type: ddb.AttributeType.STRING
            },
            readCapacity: 1,
            writeCapacity: 1,
            stream: ddb.StreamViewType.NEW_AND_OLD_IMAGES,
            sortKey: {
              name: "leagueId",
              type: ddb.AttributeType.STRING
            }
        });

        this.dataSourcesMap.ddbTables[DataSourceMapKeys.BLOG_POSTS_TABLE] = new ddb.Table(this, "BlogPosts", {
            tableName: "BlogPosts",
            partitionKey: {
              name: "id",
              type: ddb.AttributeType.STRING
            },
            pointInTimeRecovery: true,
            billingMode: ddb.BillingMode.PAY_PER_REQUEST,
            sortKey: {
              name: "owner",
              type: ddb.AttributeType.STRING
            }
        });
    }
}
