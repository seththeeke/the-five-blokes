var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    putGameweekPlayerData: async function(leagueId, teamId, gameweek, picks){
        let gameweekPlayerHistoryParams = {
            Item: {
                "leagueIdTeamId": {
                    S: leagueId + "-" + teamId
                },
                "gameweek": {
                    N: gameweek.toString()
                },
                "picks": {
                    S: JSON.stringify(picks)
                }
            },
            TableName: process.env.GAMEWEEK_PLAYER_HISTORY_TABLE_NAME
        }
        let gameweekPlayerHistoryResponse = await ddb.putItem(gameweekPlayerHistoryParams).promise();
        console.log("Persisted player history for teamId: " + teamId);
        return gameweekPlayerHistoryResponse;
    }
}