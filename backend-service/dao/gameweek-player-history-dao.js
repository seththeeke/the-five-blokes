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
        console.log("Fetching gameweek player data " + leagueId + " for gameweek " + gameweek);
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

        // Should be query eventually
        // let params = {
        //     KeyConditionExpression: "gameweek = :gameweek AND contains (id, :leagueId)",
        //     ExpressionAttributeValues: {
        //       ":gameweek": { N: parseInt(gameweek) },
        //       ":leagueId": { S: leagueId }
        //     },
        //     TableName: process.env.BADGE_TABLE_NAME,
        // };
        // let badgeResponse = await ddb.scan(params).promise();
        // return badgeResponse;
    }
}