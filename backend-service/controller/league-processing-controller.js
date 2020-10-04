var leagueProcessingService = require('./../services/league-processing-service');

exports.initiateLeague = async (event, context) => {
    try {
        console.log(JSON.stringify(event));
        let initiateLeagueRequest = {
            "dynamoDbEvent": event.Records[0],
            "leagueDetailsTableName": process.env.LEAGUE_DETAILS_TABLE_NAME
        }
        let response = await leagueProcessingService.initiateLeague(initiateLeagueRequest);
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