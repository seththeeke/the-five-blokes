var leagueAwardsSBP = require('./../season-badge-processors/league-awards-sbp');
var playerAwardsSBP = require('./../season-badge-processors/player-awards-sbp');
var playerPointsSBP = require('./../season-badge-processors/player-points-sbp');
var teamPointsSBP = require('./../season-badge-processors/team-points-sbp');
var teamStatisticsSBP = require('./../season-badge-processors/team-statistics-sbp');
var transactionsSBP = require('./../season-badge-processors/transactions-sbp');
var seasonProcessingService = require('./../services/season-processing-service');

exports.extractSeasonDataHandler = async (event) => {
    console.log(JSON.stringify(event));
    let response = await seasonProcessingService.extractSeasonData(createBadgeProcessingRequest(event));
    return response;
}

exports.assignLeagueAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let response = await leagueAwardsSBP.assignBadges(createBadgeProcessingRequest(event));
    return response;
}

exports.assignPlayerAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let response = await playerAwardsSBP.assignBadges(createBadgeProcessingRequest(event));
    return response;
}

exports.assignPlayerPointsAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let response = await playerPointsSBP.assignBadges(createBadgeProcessingRequest(event));
    return response;
}

exports.assignTeamPointsAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let response = await teamPointsSBP.assignBadges(createBadgeProcessingRequest(event));
    return response;
}

exports.assignTeamStatisticsAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let response = await teamStatisticsSBP.assignBadges(createBadgeProcessingRequest(event));
    return response;
}

exports.assignTransactionsAwardsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let response = await transactionsSBP.assignBadges(createBadgeProcessingRequest(event));
    return response;
}

function createBadgeProcessingRequest(event){
    return {
        "gameweek": event.gameweek,
        "leagueId": event.league,
    };
}