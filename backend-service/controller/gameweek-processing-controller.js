var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
var gameweekProcessService = require('./../services/gameweek-processing-service');
var gameweekMVPBadgeProcessor = require('./../gameweek-badge-processors/gameweek-mvp-badge-processor');
var gameweekStandingsBadgeProcessor = require('./../gameweek-badge-processors/gameweek-standings-badge-processor');
var gameweekPlayerStatsBadgeProcessor = require('./../gameweek-badge-processors/gameweek-player-stats-badge-processor');
AWS.config.update({region: process.env.AWS_REGION});

exports.hasGameweekCompleted = async (event) => {
    console.log(JSON.stringify(event));
    let response = await gameweekProcessService.hasGameweekCompleted(event.forceGameweekReprocessing, event.shouldOverrideSeasonCompletedChoice);
    return response;
}

exports.extractGameweekDataHandler = async (event) => {
    console.log(JSON.stringify(event));
    let extractGameweeDataRequest = {
        "leagueId": event[0].league,
        "gameweekNum": event[0].gameweek,
        "shouldOverrideSeasonCompletedChoice": event.shouldOverrideSeasonCompletedChoice
    }
    let response = await gameweekProcessService.extractGameweekData(extractGameweeDataRequest);
    return response;
}

exports.extractTransactionsHandler = async (event) => {
    console.log(JSON.stringify(event));
    let response = await gameweekProcessService.extractTransactions(event);
    return response;
}

// BADGE Processors
exports.assignGameweekStandingsBadgesHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignGameweekBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await gameweekStandingsBadgeProcessor.assignGameweekStandingsBadges(assignGameweekBadgesRequest);
    return response;
}

exports.assignGameweekMVPBadgeHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignGameweekBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await gameweekMVPBadgeProcessor.assignGameweekMVPBadge(assignGameweekBadgesRequest);
    return response;
}

exports.assignGameweekPlayerStatBadgesHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignGameweekBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await gameweekPlayerStatsBadgeProcessor.assignGameweekPlayerStatBadges(assignGameweekBadgesRequest);
    return response;
}