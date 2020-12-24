var leagueAwardsSBP = require('./../season-badge-processors/league-awards-sbp');
var playerAwardsSBP = require('./../season-badge-processors/player-awards-sbp');
var playerPointsSBP = require('./../season-badge-processors/player-points-sbp');
var teamPointsSBP = require('./../season-badge-processors/team-points-sbp');
var teamStatisticsSBP = require('./../season-badge-processors/team-statistics-sbp');
var transactionsSBP = require('./../season-badge-processors/transactions-sbp');

exports.assignLeagueAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignSeasonBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await leagueAwardsSBP.assignBadges(assignSeasonBadgesRequest);
    return response;
}

exports.assignPlayerAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignSeasonBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await playerAwardsSBP.assignBadges(assignSeasonBadgesRequest);
    return response;
}

exports.assignPlayerPointsAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignSeasonBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await playerPointsSBP.assignBadges(assignSeasonBadgesRequest);
    return response;
}

exports.assignTeamPointsAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignSeasonBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await teamPointsSBP.assignBadges(assignSeasonBadgesRequest);
    return response;
}

exports.assignTeamStatisticsAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignSeasonBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await teamStatisticsSBP.assignBadges(assignSeasonBadgesRequest);
    return response;
}

exports.assignTransactionsAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignSeasonBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await transactionsSBP.assignBadges(assignSeasonBadgesRequest);
    return response;
}