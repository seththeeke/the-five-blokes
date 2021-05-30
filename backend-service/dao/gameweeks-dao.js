var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    getLatestGameweek: async function(activeLeague){
        console.log("Fetching latest gameweek for league " + activeLeague.leagueId.S);
        let gameweekQueryForLeagueParams = {
            KeyConditionExpression: "leagueId = :leagueId",
            ExpressionAttributeValues: {
              ":leagueId": { S: activeLeague.leagueId.S }
            },
            TableName: process.env.GAMEWEEK_TABLE_NAME,
            ScanIndexForward: false
        };
        let gameweekDetails = await ddb.query(gameweekQueryForLeagueParams).promise();
        let gameweekItems = gameweekDetails.Items;
        return gameweekItems[0];
    },

    getAllGameweeksForLeague: async function(activeLeague){
        let gameweekScanParams = {
            TableName: process.env.GAMEWEEK_TABLE_NAME
        }
        let gameweekDetails = await ddb.scan(gameweekScanParams).promise();
        let gameweekItems = gameweekDetails.Items;
        let allGameweeksForLeague = [];
        for (let i in gameweekItems){
            let gameweek = gameweekItems[i];
            if (gameweek.leagueId.S === activeLeague.leagueId.S){
                // this is strange and not the same paradigm I use elsewhere, should probably try to fix this
                allGameweeksForLeague.push({
                    "gameweek": gameweek.gameweek.N,
                    "standings": gameweek.standings.S,
                    "fixtures": gameweek.fixtures.S
                });
            }
        }
        return allGameweeksForLeague;
    },

    putGameweek: async function(leagueId, gameweek, standings, gameweekFixtures, gameweekPlayerData){
        let gameweekUpdateParams = {
            Item: {
                "leagueId": {
                    S: leagueId
                },
                "gameweek": {
                    N: gameweek.toString()
                },
                "standings": {
                    S: JSON.stringify(standings)
                },
                "fixtures": {
                    S: JSON.stringify(gameweekFixtures)
                },
                "gameweekPlayerStats": {
                    S: JSON.stringify(gameweekPlayerData)
                }
            },
            TableName: process.env.GAMEWEEK_TABLE_NAME
        }
        let gameweekUpdateResponse = await ddb.putItem(gameweekUpdateParams).promise();
        console.log("Successfully saved gameweek with params " + gameweekUpdateParams);
        return gameweekUpdateResponse;
    }
}