var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
var sns = new AWS.SNS({apiVersion: '2010-03-31'});
var gameweekProcessService = require('./../services/gameweek-processing-service');
AWS.config.update({region: process.env.AWS_REGION});

exports.hasGameweekCompleted = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let hasGameweekCompletedRequest = {
            "leagueDetailsTableName": process.env.LEAGUE_DETAILS_TABLE_NAME,
            "gameweekTableName": process.env.GAMEWEEK_TABLE_NAME,
            "gameweekCompletedTopicArn": process.env.GAMEWEEK_COMPLETED_TOPIC_ARN,
            "seasonCompletedTopicArn": process.env.SEASON_COMPLETED_TOPIC_ARN
        }
        let response = await gameweekProcessService.hasGameweekCompleted(hasGameweekCompletedRequest);
        return respond(response);
    } catch (err) {
        console.log(err);
        let errorResponse = await errWithNotify(err);
        return errorResponse;
    }
}

exports.gameweekCompletedHandler = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let gameweekCompletedRequest = {
            "leagueDetailsTableName": process.env.LEAGUE_DETAILS_TABLE_NAME,
            "gameweekTableName": process.env.GAMEWEEK_TABLE_NAME,
            "badgeTableName": process.env.BADGE_TABLE_NAME,
            "gameweekPlayerHistoryTableName": process.env.GAMEWEEK_PLAYER_HISTORY_TABLE_NAME,
            "leagueId": event.Records[0].Sns.Subject,
            "gameweekNum": event.Records[0].Sns.Message,
            "staticContentBucketName": process.env.STATIC_CONTENT_BUCKET_NAME
        }
        let response = await gameweekProcessService.processGameweekCompleted(gameweekCompletedRequest);
        return respond(response);
    } catch (err) {
        console.log(err);
        let errorResponse = await errWithNotify(err);
        return errorResponse;
    }
}

async function errWithNotify(message){
    var errorMessageSNSParams = {
        Message: JSON.stringify(message),
        Subject: "Error occurred during fantasy processing",
        TopicArn: process.env.ERROR_TOPIC_ARN
    };
    let errorPublishResponse = await sns.publish(errorMessageSNSParams).promise();
    return error(message);
}

function respond(responseData){
    return {
        'statusCode': 200,
        'body': JSON.stringify({
            'data': responseData
        }),
        'headers': {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        }
    };
}

function error(message){
    console.log(message);
    return {
        'statusCode': 500,
        'body': JSON.stringify({
            'err': message
        }),
        'headers': {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        }
    };
}