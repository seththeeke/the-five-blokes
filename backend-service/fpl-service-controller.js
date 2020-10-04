var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
var sns = new AWS.SNS({apiVersion: '2010-03-31'});
var fplService = require('./fpl-service');
AWS.config.update({region: process.env.AWS_REGION});

exports.addNewLeague = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let addNewLeagueRequest = {
            "leagueId": event.body.leagueId,
            "leagueDetailsTableName": process.env.LEAGUE_DETAILS_TABLE_NAME
        }
        let response = await fplService.addNewLeague(addNewLeagueRequest);
        return respond(response);
    } catch (err) {
        console.log(err);
        return error(err);
    }
}

exports.initiateLeague = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let initiateLeagueRequest = {
            "dynamoDbEvent": event.Records[0],
            "leagueDetailsTableName": process.env.LEAGUE_DETAILS_TABLE_NAME
        }
        let response = await fplService.initiateLeague(initiateLeagueRequest);
        return respond(response);
    } catch (err) {
        console.log(err);
        return error(err);
    }
}

exports.hasGameweekCompleted = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let hasGameweekCompletedRequest = {
            "leagueDetailsTableName": process.env.LEAGUE_DETAILS_TABLE_NAME,
            "gameweekTableName": process.env.GAMEWEEK_TABLE_NAME,
            "gameweekCompletedTopicArn": process.env.GAMEWEEK_COMPLETED_TOPIC_ARN,
            "seasonCompletedTopicArn": process.env.SEASON_COMPLETED_TOPIC_ARN
        }
        let response = await fplService.hasGameweekCompleted(hasGameweekCompletedRequest);
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
        let response = await fplService.processGameweekCompleted(gameweekCompletedRequest);
        return respond(response);
    } catch (err) {
        console.log(err);
        let errorResponse = await errWithNotify(err);
        return errorResponse;
    }
}

exports.getAllParticipants = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let response = await fplService.getAllParticipants();
        return respond(response);
    } catch (err) {
        console.log(err);
        return error(err);
    }
}

exports.getLatestGameweek = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let response = await fplService.getLatestGameweek();
        return respond(response);
    } catch (err) {
        console.log(err);
        return error(err);
    }
}

exports.getStandingsHistoryForActiveLeague = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let response = await fplService.getStandingsHistoryForActiveLeague();
        return respond(response);
    } catch (err) {
        console.log(err);
        return error(err);
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