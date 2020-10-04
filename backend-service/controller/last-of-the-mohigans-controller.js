var lastOfTheMohigansService = require('./../services/last-of-the-mohigans-service');

exports.addNewLeague = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let addNewLeagueRequest = {
            "leagueId": event.body.leagueId,
            "leagueDetailsTableName": process.env.LEAGUE_DETAILS_TABLE_NAME
        }
        let response = await lastOfTheMohigansService.addNewLeague(addNewLeagueRequest);
        return respond(response);
    } catch (err) {
        console.log(err);
        return error(err);
    }
}

exports.getAllParticipants = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let response = await lastOfTheMohigansService.getAllParticipants();
        return respond(response);
    } catch (err) {
        console.log(err);
        return error(err);
    }
}

exports.getLatestGameweek = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let response = await lastOfTheMohigansService.getLatestGameweek();
        return respond(response);
    } catch (err) {
        console.log(err);
        return error(err);
    }
}

exports.getStandingsHistoryForActiveLeague = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let response = await lastOfTheMohigansService.getStandingsHistoryForActiveLeague();
        return respond(response);
    } catch (err) {
        console.log(err);
        return error(err);
    }
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