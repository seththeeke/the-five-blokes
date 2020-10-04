var badgesDao = require('./../dao/badges-dao');
var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweeksDao = require('./../dao/gameweeks-dao');

/**
 * Api for lastofthemohigans.com, should only consume data from normalized data stores rather than query the FPL Service. 
 * That will ensure the ETL process provides normalized data regardless of the season
 */
module.exports = {
    addNewLeague: async function(addNewLeagueRequest){
        let newLeagueResponse = await leagueDetailsDao.addNewLeague(addNewLeagueRequest.leagueId);
        console.log("Successfully added league with leagueId " + addNewLeagueRequest.leagueId);
        return newLeagueResponse;
    },

    getAllParticipants: async function() {
        // Get and Sort all the Badges by participantId
        let allBadges = await badgesDao.getAllBadges();
        let badgeMap = {};
        for (let i in allBadges.Items) {
            let badge = allBadges.Items[i];
            if (badgeMap[badge.participantId.S]){
                let badges = badgeMap[badge.participantId.S];
                badges.push(badge);
                badgeMap[badge.participantId.S] = badges;
            } else {
                badgeMap[badge.participantId.S] = [badge];
            }   
        }

        let allLeagueDetails = await leagueDetailsDao.getAllLeagueDetails();
        let participantsResponse = {};
        for (let i in allLeagueDetails.Items) {
            let leagueDetails = allLeagueDetails.Items[i];
            let participants = JSON.parse(leagueDetails.participants.S);
            for (let j in participants) {
                let participant = participants[j];
                let participantId = participant.id.toString();
                if (!participantsResponse[participantId]){
                    participantsResponse[participantId] = {
                        "participant": participant,
                        "badges": badgeMap[participantId]
                    };
                }
            }
        }

        return participantsResponse;
    },

    getLatestGameweek: async function() {
        let activeLeague = await leagueDetailsDao.getActiveLeague();
        let lastCompletedGameweek = await gameweeksDao.getLatestGameweek(activeLeague);
        return lastCompletedGameweek;
    },

    getStandingsHistoryForActiveLeague: async function(){
        let activeLeague = await leagueDetailsDao.getActiveLeague();
        let allGameweeksForLeagueId = await gameweeksDao.getAllGameweeksForLeague(activeLeague);
        return allGameweeksForLeagueId;
    }
}