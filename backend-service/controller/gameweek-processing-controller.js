var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
var gameweekProcessService = require('./../services/gameweek-processing-service');
AWS.config.update({region: process.env.AWS_REGION});

exports.hasGameweekCompleted = async (event) => {
    console.log(JSON.stringify(event));
    let response = await gameweekProcessService.hasGameweekCompleted();
    return response;
}

exports.extractGameweekDataHandler = async (event) => {
    console.log(JSON.stringify(event));
    let extractGameweeDataRequest = {
        "leagueId": event.league,
        "gameweekNum": event.gameweek
    }
    let response = await gameweekProcessService.extractGameweekData(extractGameweeDataRequest);
    return response;
}

// ASSIGN BADGE HANDLERS

exports.assignGameweekStandingsBadgesHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignGameweekBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await gameweekProcessService.assignGameweekStandingsBadges(assignGameweekBadgesRequest);
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
    let response = await gameweekProcessService.assignGameweekMVPBadge(assignGameweekBadgesRequest);
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
    let response = await gameweekProcessService.assignGameweekPlayerStatBadges(assignGameweekBadgesRequest);
    return response;
}