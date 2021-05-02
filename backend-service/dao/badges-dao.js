var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    /**
     * @deprecated use addNewBadgeWithParticipants instead, this relies on the leagueDetails object
     * provided by the fpl draft api instead of the domain leagueDetails object
     */
    addNewBadge: async function(id, participantId, badgeType, badgeMetadata, leagueDetails){
        let newBadgeParams = {
            Item: {
                "id": {
                    S: id
                },
                "participantId": {
                    S: participantId
                },
                "badgeType": {
                    S: badgeType
                },
                "badgeMetadata": {
                    S: JSON.stringify(badgeMetadata)
                },
                "participantName": {
                    S: this._getParticipantFullName(leagueDetails.league_entries, participantId)
                }
            },
            TableName: process.env.BADGE_TABLE_NAME
        }
        let newBadgeResponse = await ddb.putItem(newBadgeParams).promise();
        console.log("Added new badge: " + JSON.stringify(newBadgeParams));
    },

    addNewBadgeWithParticipants: async function(id, participantId, badgeType, badgeMetadata, participants){
        let newBadgeParams = {
            Item: {
                "id": {
                    S: id
                },
                "participantId": {
                    S: participantId
                },
                "badgeType": {
                    S: badgeType
                },
                "badgeMetadata": {
                    S: JSON.stringify(badgeMetadata)
                },
                "participantName": {
                    S: this._getParticipantFullName(participants, participantId)
                }
            },
            TableName: process.env.BADGE_TABLE_NAME
        }
        let newBadgeResponse = await ddb.putItem(newBadgeParams).promise();
        console.log("Added new badge: " + JSON.stringify(newBadgeParams));
    },

    getAllBadges: async function(){
        let badgeScanParams = {
            TableName: process.env.BADGE_TABLE_NAME
        }
        let allBadgesResponse = await ddb.scan(badgeScanParams).promise();
        return allBadgesResponse;
    },

    getBadgesByType: async function(leagueId, badgeType){
        let params = {
            FilterExpression: "badgeType = :badgeType AND contains (id, :leagueId)",
            ExpressionAttributeValues: {
              ":badgeType": { S: badgeType },
              ":leagueId": { S: leagueId }
            },
            TableName: process.env.BADGE_TABLE_NAME,
        };
        let badgeResponse = await ddb.scan(params).promise();
        return badgeResponse;
    },

    _getParticipantFullName: function(participants, participantId) {
        for (let i in participants) {
            let participant = participants[i];
            if (participant.id.toString() === participantId) {
                return participant.player_first_name + " " + participant.player_last_name;
            }
        }
    },
}