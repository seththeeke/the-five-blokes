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

    /**
     * Used for The Boys widget to display all participants and their badges and history
     */
    getAllParticipants: async function() {
        // Get and Sort all the Badges by participantName, there is no unique id between seasons
        // so banking on nobody having the same first and last name in the same league
        let allBadges = await badgesDao.getAllBadges();
        let badgeMap = {};
        for (let i in allBadges.Items) {
            let badge = allBadges.Items[i];
            if (badgeMap[badge.participantName.S]){
                let badges = badgeMap[badge.participantName.S];
                badges.push(badge);
                badgeMap[badge.participantName.S] = badges;
            } else {
                badgeMap[badge.participantName.S] = [badge];
            }   
        }

        let allLeagueDetails = await leagueDetailsDao.getAllLeagueDetails();
        let participantsResponse = {};
        for (let i in allLeagueDetails.Items) {
            let leagueDetails = allLeagueDetails.Items[i];
            let participants = JSON.parse(leagueDetails.participants.S);
            for (let j in participants) {
                let participant = participants[j];
                let participantName = participant.player_first_name + " " + participant.player_last_name;
                if (!participantsResponse[participantName]){
                    participantsResponse[participantName] = {
                        "participant": participant,
                        "badges": badgeMap[participantName]
                    };
                }
            }
        }

        return participantsResponse;
    },

    /**
     * Used for the gameweek badges widget, fetches all the badges and participants
     * for a leagueId and returns them to the client for view
     */
    getGameweekBadgeHistoryForLeague: async function(request) {
        let leagueId = request.leagueId;
        let allBadges = await badgesDao.getAllBadgesForLeagueId(leagueId);
        console.log("Found " + allBadges.length + " badges for leagueId " + leagueId);
        let badgeMap = {};
        for (let i in allBadges) {
            let badge = allBadges[i];
            if (badgeMap[badge.participantId.S]){
                let badges = badgeMap[badge.participantId.S];
                badges.push(badge);
                badgeMap[badge.participantId.S] = badges;
            } else {
                badgeMap[badge.participantId.S] = [badge];
            }   
        }

        let leagueDetails = await leagueDetailsDao.getLeagueDetailsById(leagueId);
        let participantsResponse = {};
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

        return participantsResponse;
    },

    getLatestGameweek: async function(leagueId) {
        let leagueForGameweek;
        if (leagueId){
            leagueForGameweek = await leagueDetailsDao.getLeagueDetailsById(leagueId);
        } else {
            leagueForGameweek = await leagueDetailsDao.getActiveLeague();
        }
        let lastCompletedGameweek = await gameweeksDao.getLatestGameweek(leagueForGameweek);
        return lastCompletedGameweek;
    },

    getStandingsHistoryForActiveLeague: async function(leagueId){
        let league;
        if (leagueId){
            league = await leagueDetailsDao.getLeagueDetailsById(leagueId);
        } else {
            league = await leagueDetailsDao.getActiveLeague();
        }
        let standingsHistoryForLeague = await gameweeksDao.getAllGameweeksForLeague(league);
        return standingsHistoryForLeague;
    },

    getAllLeagueDetails: async function() {
        let allLeagueDetails = await leagueDetailsDao.getAllLeagueDetails();
        return allLeagueDetails;
    }
}