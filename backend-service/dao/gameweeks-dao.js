var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    getLatestGameweek: async function(activeLeague){
        let gameweekScanParams = {
            TableName: process.env.GAMEWEEK_TABLE_NAME
        }
        let gameweekDetails = await ddb.scan(gameweekScanParams).promise();
        let gameweekItems = gameweekDetails.Items;
        let lastCompletedGameweek = undefined;
        for (let i in gameweekItems){
            let gameweek = gameweekItems[i];
            if (gameweek.leagueId.S === activeLeague.leagueId.S && 
                (!lastCompletedGameweek || gameweek.gameweek.N > lastCompletedGameweek.gameweek.N)){
                lastCompletedGameweek = gameweek;
            }
        }
        console.log("Found latest gameweek: " + JSON.stringify(lastCompletedGameweek));
        return lastCompletedGameweek;
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
                allGameweeksForLeague.push({
                    "gameweek": gameweek.gameweek.N,
                    "standings": gameweek.standings.S
                });
            }
        }
        return allGameweeksForLeague;
    }
}