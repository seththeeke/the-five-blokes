var badgesDao = require('./../dao/badges-dao');
var BADGE_TYPE = require('./../util/badge-type');
var leagueDetailsDao = require('./../dao/league-details-dao');
var draftPicksDao = require('./../dao/draft-picks-dao');

module.exports = {

    assignBadges: async function(assignSeasonBadgesRequest) {
        let leagueDetails = await leagueDetailsDao.getLeagueDetailsById(assignSeasonBadgesRequest.leagueId);
        let participants = JSON.parse(leagueDetails.participants.S);
        let firstRoundDraftPicks = await draftPicksDao.getFirstRoundDraftPicksForLeagueId(assignSeasonBadgesRequest.leagueId);
        let sortedPicks = firstRoundDraftPicks.Items.sort(function(a, b){
            return parseInt(a.pick.N) - parseInt(b.pick.N);
        });

        let firstPick = sortedPicks[0];
        let lastPick = sortedPicks[sortedPicks.length - 1];

        let firstPickParticipant = participants.filter(function(part){
            return part.entry_name === firstPick.entry_name.S
        });
        let firstRoundDraftPickBadge = await badgesDao.addNewBadgeWithParticipants(
            leagueDetails.leagueId.S.toString() + "-" + firstPickParticipant[0].id.toString() + "-" + BADGE_TYPE.FIRST_DRAFT_PICK,
            firstPickParticipant[0].id.toString(),
            BADGE_TYPE.FIRST_DRAFT_PICK, 
            {
                "year": leagueDetails.year.S,
                "value": firstPick.draft_rank.N,
                "player": {
                    "player_first_name": firstPick.player_first_name.S,
                    "player_last_name": firstPick.player_last_name.S
                },
            },
            JSON.parse(leagueDetails.participants.S)
        );

        let lastPickParticipant = participants.filter(function(part){
            return part.entry_name === lastPick.entry_name.S
        });
        let lastRoundDraftPickBadge = await badgesDao.addNewBadgeWithParticipants(
            leagueDetails.leagueId.S.toString() + "-" + lastPickParticipant[0].id.toString() + "-" + BADGE_TYPE.LAST_DRAFT_PICK,
            lastPickParticipant[0].id.toString(),
            BADGE_TYPE.LAST_DRAFT_PICK, 
            {
                "year": leagueDetails.year.S,
                "value": lastPick.draft_rank.N,
                "player": {
                    "player_first_name": lastPick.player_first_name.S,
                    "player_last_name": lastPick.player_last_name.S
                },
            },
            JSON.parse(leagueDetails.participants.S)
        );

        return {
            "success": true,
        }
    }
}