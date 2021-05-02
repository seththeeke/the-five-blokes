var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    addNewLeague: async function(leagueId){
        var addNewLeagueParams = {
            Item: {
                "leagueId": {
                    S: leagueId
                },
                "isActive": {
                    BOOL: true
                },
                "year": {
                    S: new Date().getFullYear().toString()
                }
            },
            TableName: process.env.LEAGUE_DETAILS_TABLE_NAME
        };
        let ddbResponse = await ddb.putItem(addNewLeagueParams).promise();
        console.log("Added new league: " + JSON.stringify(addNewLeagueParams));
        return ddbResponse;
    },

    updateLeague: async function(leagueId, isActive, year, leagueInfo, participants){
        var updateLeagueParams = {
            Item: {
                "leagueId": {
                    S: leagueId
                },
                "isActive": {
                    BOOL: isActive
                },
                "year": {
                    S: year
                },
                "leagueInfo": {
                    S: JSON.stringify(leagueInfo)
                },
                "participants": {
                    S: JSON.stringify(participants)
                }
            },
            TableName: process.env.LEAGUE_DETAILS_TABLE_NAME
        };
        let updateLeagueResponse = await ddb.putItem(updateLeagueParams).promise();
        console.log("Updated league with params: " + JSON.stringify(updateLeagueParams));
        return updateLeagueResponse;
    },

    getActiveLeague: async function(){
        let leagueDetails = await this.getAllLeagueDetails()
        let activeLeague = undefined;
        for (let i in leagueDetails.Items){
            let league = leagueDetails.Items[i];
            if (league.isActive.BOOL){
                console.log("Found active league with leagueId " + league.leagueId.S);
                activeLeague = league;
            }
        }
        return activeLeague;
    },

    getLeagueDetailsById: async function(leagueId){
        let leagueDetails = await this.getAllLeagueDetails()
        let leagueWithLeagueId = undefined;
        for (let i in leagueDetails.Items){
            let league = leagueDetails.Items[i];
            if (league.leagueId.S === leagueId){
                leagueWithLeagueId = league;
            }
        }
        return leagueWithLeagueId;
    },

    getAllLeagueDetails: async function(){
        let leagueDetailsScanParams = {
            TableName: process.env.LEAGUE_DETAILS_TABLE_NAME
        }
        let leagueDetails = await ddb.scan(leagueDetailsScanParams).promise();
        return leagueDetails;
    }
}