var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var badgesDao = require('./../dao/badges-dao');
var leagueDetailsDao = require('./../dao/league-details-dao');
var fplDraftService = require('./fpl-draft-service');

/**
 * All functions related to processing a particular league event, initiating new leagues, collecting data, normalizing, badging
 */
module.exports = {
    initiateLeague: async function(initiateLeagueRequest){
        let dynamoDbEvent = initiateLeagueRequest.dynamoDbEvent;
        if (dynamoDbEvent.eventName === "INSERT"){
            let leagueDetailsDDB = dynamoDbEvent.dynamodb.NewImage;
            let response = await fplDraftService.getLeagueDetails(leagueDetailsDDB.leagueId.S);
            let leagueDetails = response.data;
            let updateLeagueResponse = await leagueDetailsDao.updateLeague(leagueDetailsDDB.leagueId.S, leagueDetailsDDB.isActive.BOOL, leagueDetailsDDB.year.S, leagueDetails.league, leagueDetails.league_entries);
            console.log("Successfully saved league details for start of season");
            let preseasonBadges = await this._addPreseasonBadges({
                "leagueDetails": leagueDetails
            });
            return {
                ddbResponse,
                preseasonBadges
            };
        } else {
            console.log("Cannot initiate league that has already been created");
        }
    },

    _addPreseasonBadges: async function(addBadgesForLeagueUpdateRequest){
        console.log("Beginning to badge league initiation badges: " + JSON.stringify(addBadgesForLeagueUpdateRequest));
        let participantBadges = await this._badgeParticipants(addBadgesForLeagueUpdateRequest.leagueDetails);
        return {
            participantBadges
        };
    },

    _badgeParticipants: async function(leagueDetails) {
        console.log("Beginning to badge league participants: " + JSON.stringify(leagueDetails));
        let participants = leagueDetails.league_entries
        for (let i in participants){
            let participant = participants[i];
            let participantResponse = await badgesDao.addNewBadge(
                leagueDetails.league.id.toString() + "-" + participant.id.toString() + "-Participant",
                participant.id.toString(),
                "Participant", 
                {
                    "year": leagueDetails.league.draft_dt.substring(0, 4),
                    "detail": leagueDetails.league.draft_dt.substring(0, 4) + " - " + participant.entry_name,
                },
                leagueDetails);
        }
    }

}