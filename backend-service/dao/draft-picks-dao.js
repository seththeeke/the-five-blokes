var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    getFirstRoundDraftPicksForLeagueId: async function(leagueId){
        let params = {
            FilterExpression: "league_id = :leagueId AND round = :round",
            ExpressionAttributeValues: {
              ":leagueId": { S: leagueId },
              ":round": { N: "1" }
            },
            TableName: process.env.DRAFT_PICKS_TABLE_NAME,
        };
        let firstRoundPicks = await ddb.scan(params).promise();
        return firstRoundPicks;
    },

    getDraftPicksForLeagueId: async function(leagueId){
        let params = {
            FilterExpression: "league_id = :leagueId",
            ExpressionAttributeValues: {
              ":leagueId": { S: leagueId }
            },
            TableName: process.env.DRAFT_PICKS_TABLE_NAME,
        };
        let firstRoundPicks = await ddb.scan(params).promise();
        return firstRoundPicks;
    }
}