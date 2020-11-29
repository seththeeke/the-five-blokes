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
    },

    getGameweekPlayerDataForGameweek: async function(leagueId, gameweek) {
        let gameweekPlayerScanParams = {
            TableName: process.env.GAMEWEEK_PLAYER_HISTORY_TABLE_NAME
        }
        let gameweekPlayerDetails = await ddb.scan(gameweekPlayerScanParams).promise();
        let gameweekPlayerItems = gameweekPlayerDetails.Items;
        let playerHistoryForGameweek = [];
        for (let i in gameweekPlayerItems){
            let gameweekPlayerData = gameweekPlayerItems[i];
            if (gameweekPlayerData.leagueIdTeamId.S.indexOf(leagueId) === 0 && gameweekPlayerData.gameweek.N === gameweek.toString()){
                playerHistoryForGameweek.push(gameweekPlayerData);
            }
        }
        console.log("Found gameweek data: " + JSON.stringify(playerHistoryForGameweek));
        return playerHistoryForGameweek;
    }
}