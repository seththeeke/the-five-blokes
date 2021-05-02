var badgesDao = require('./../dao/badges-dao');
var gameweeksDao = require('./../dao/gameweeks-dao');
var leagueDetailsDao = require('./../dao/league-details-dao');
var BADGE_TYPE = require('./../util/badge-type');

module.exports = {

    assignBadges: async function(assignSeasonBadgesRequest) {
        let leagueDetails = await leagueDetailsDao.getLeagueDetailsById(assignSeasonBadgesRequest.leagueId);
        let lastCompletedGameweek = await gameweeksDao.getLatestGameweek(leagueDetails);
        let standings = JSON.parse(lastCompletedGameweek.standings.S);
        let participants = JSON.parse(leagueDetails.participants.S);

        let firstPlace = standings[0];
        let lastPlace = standings[standings.length - 1];

        let twelveFiftyPointSeason = [];
        let fifteenHundredPointSeason = [];
        let seventeenFiftyPointSeason = [];
        let twoThousandPointSeason = [];
        for (let i in standings) {
            let entry = standings[i];
            if (entry.total >= 1250){
                twelveFiftyPointSeason.push(entry);
            }
            if (entry.total >= 1500){
                fifteenHundredPointSeason.push(entry);
            }
            if (entry.total >= 1750){
                seventeenFiftyPointSeason.push(entry);
            }
            if (entry.total >= 2000){
                twoThousandPointSeason.push(entry);
            }
        }

        let leagueWinnerBadge = await this._assignBadge(leagueDetails, firstPlace, BADGE_TYPE.SEASON_CHAMPION, firstPlace.total, participants);
        let leagueLoserBadge = await this._assignBadge(leagueDetails, lastPlace, BADGE_TYPE.SEASON_LOSER, lastPlace.total, participants);
        for (let i in twelveFiftyPointSeason) {
            let entry = twelveFiftyPointSeason[i];
            let badge = await this._assignBadge(leagueDetails, entry, BADGE_TYPE._1250_POINT_SEASON, entry.total, participants);
        }
        for (let i in fifteenHundredPointSeason) {
            let entry = fifteenHundredPointSeason[i];
            let badge = await this._assignBadge(leagueDetails, entry, BADGE_TYPE._1500_POINT_SEASON, entry.total, participants);
        }
        for (let i in seventeenFiftyPointSeason) {
            let entry = seventeenFiftyPointSeason[i];
            let badge = await this._assignBadge(leagueDetails, entry, BADGE_TYPE._1750_POINT_SEASON, entry.total, participants);
        }
        for (let i in twoThousandPointSeason) {
            let entry = twoThousandPointSeason[i];
            let badge = await this._assignBadge(leagueDetails, entry, BADGE_TYPE._2000_POINT_SEASON, entry.total, participants);
        }

        return {
            "success": true
        }
    },

    _assignBadge: async function(leagueDetails, winner, badgeType, badgeValue, participants){
        let entry = participants.filter(participant => participant.id.toString() === winner.league_entry.toString())[0];
        let badge = await badgesDao.addNewBadgeWithParticipants(
            leagueDetails.leagueId.S + "-" + badgeType,
            entry.id.toString(),
            badgeType,
            {
                "year": leagueDetails.year.S,
                "value": badgeValue
            },
            participants
        );
        return badge;
    }
}