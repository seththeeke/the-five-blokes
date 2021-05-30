var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweeksDao = require('./../dao/gameweeks-dao');
var gameweekPlayerDataDao = require('./../dao/gameweek-player-history-dao');
var emailSubscriptionsDao = require('./../dao/email-subscriptions-dao');
var badgesDao = require('./../dao/badges-dao');

var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ses = new AWS.SES({apiVersion: '2010-12-01'});

var BADGE_TYPE = require('./../util/badge-type');

var MEDIA_ASSETS_BASE_URL = process.env.MEDIA_ASSETS_BUCKET_URL;
var headerIcon = MEDIA_ASSETS_BASE_URL + "/circular-prem-lion.png";
var thumbsUpIcon = MEDIA_ASSETS_BASE_URL + "/thumbs-up.png";
var thumbsDownIcon = MEDIA_ASSETS_BASE_URL + "/thumbs-down.png";
var pointsIcon = MEDIA_ASSETS_BASE_URL + "/gameweek-winner.png";
var goalsIcon = MEDIA_ASSETS_BASE_URL + "/football-ball.png";
var assistsIcon = MEDIA_ASSETS_BASE_URL + "/kick-ball.png";
var podiumImg = MEDIA_ASSETS_BASE_URL + "/podium.png";
var leagueTrophyIcon = MEDIA_ASSETS_BASE_URL + "/league-champion.png";
var goldenBootIcon = MEDIA_ASSETS_BASE_URL + "/golden-boot-season-winner.png";
var playmakerIcon = MEDIA_ASSETS_BASE_URL + "/playmaker-of-the-season.png";
var seasonLoserIcon = MEDIA_ASSETS_BASE_URL + "/season-loser.png";
var seasonMVPIcon = MEDIA_ASSETS_BASE_URL + "/season-mvp-player.png";

module.exports = {
    sendGameweekProcessingCompletedEmail: async function(){
        console.log("Beginning to form and send gameweek processing email");
        let activeLeague = await leagueDetailsDao.getActiveLeague();
        let lastCompletedGameweek = await gameweeksDao.getLatestGameweek(activeLeague);

        let participants = JSON.parse(activeLeague.participants.S);
        let standings = JSON.parse(lastCompletedGameweek.standings.S);
        let gameweekPlayerStats = JSON.parse(lastCompletedGameweek.gameweekPlayerStats.S);
        let gameweekStandings = JSON.parse(lastCompletedGameweek.standings.S);
        // sort by gameweek total, standings come sorted by league standings
        gameweekStandings.sort(function(a, b) {
            return b.event_total - a.event_total
        });
        let gameweek = lastCompletedGameweek.gameweek.N;
        let gameweekPlayerHistoryForGameweek = await gameweekPlayerDataDao.getGameweekPlayerDataForGameweek(activeLeague.leagueId.S, gameweek);

        // Aggregate the data for the gameweek by player
        let aggregatedData = {};
        let mostGoals = -1;
        let mostAssists = -1;
        for (let i in gameweekPlayerHistoryForGameweek) {
            let gameweekDataForEntry = gameweekPlayerHistoryForGameweek[i];
            let picks = JSON.parse(gameweekDataForEntry.picks.S);
            let teamId = gameweekDataForEntry.leagueIdTeamId.S.substring(gameweekDataForEntry.leagueIdTeamId.S.indexOf("-") + 1);
            aggregatedData[teamId] = {
                "goals": 0,
                "assists": 0
            };
            for (let j in picks){
                let pick = picks[j];
                let playerData = gameweekPlayerStats[pick.element.toString()];
                if (playerData){
                    if (playerData.goals_scored){
                        aggregatedData[teamId].goals = aggregatedData[teamId].goals + playerData.goals_scored;
                        mostGoals = Math.max(mostGoals, aggregatedData[teamId].goals);
                    }
                    if (playerData.assists) {
                        aggregatedData[teamId].assists = aggregatedData[teamId].assists + playerData.assists;
                        mostAssists = Math.max(mostAssists, aggregatedData[teamId].assists);
                    }
                }
            }
        }

        // find the best and worst performers of the week
        let mostGoalsFirstNames = [];
        let leastGoalsFirstNames = [];
        let mostAssistsFirstNames = [];
        let leastAssistsFirstNames = [];
        let leastGoals = 100;
        let leastAssists = 100;
        for (let teamId in aggregatedData) {
            let teamData = aggregatedData[teamId];
            leastGoals = Math.min(leastGoals, teamData.goals);
            leastAssists = Math.min(leastAssists, teamData.assists);
            if (teamData.goals === mostGoals) {
                mostGoalsFirstNames.push(this._getParticipantFirstNameByEntryId(participants, teamId));
            }
            if (teamData.assists === mostAssists) {
                mostAssistsFirstNames.push(this._getParticipantFirstNameByEntryId(participants, teamId));
            }
        }
        for (let teamId in aggregatedData) {
            let teamData = aggregatedData[teamId];
            if (teamData.goals === leastGoals) {
                leastGoalsFirstNames.push(this._getParticipantFirstNameByEntryId(participants, teamId));
            }
            if (teamData.assists === leastAssists) {
                leastAssistsFirstNames.push(this._getParticipantFirstNameByEntryId(participants, teamId));
            }
        }

        let emailAddresses = await emailSubscriptionsDao.getAllSubscriptions();
        for (let i in emailAddresses.Items) {
            let emailAddress = emailAddresses.Items[i].emailAddress.S;
            let sendEmailParams = {
                Destination: {
                  ToAddresses: [
                    emailAddress,
                  ]
                },
                Template: 'GameweekCompleted', // should be env var
                TemplateData: JSON.stringify(
                    {
                        "gameweek": gameweek,
                        "podiumImg": podiumImg,
                        "firstPlace": this._getParticipantFirstName(participants, standings[0].league_entry),
                        "secondPlace": this._getParticipantFirstName(participants, standings[1].league_entry),
                        "thirdPlace": this._getParticipantFirstName(participants, standings[2].league_entry),
                        "firstPlacePoints": standings[0].total,
                        "secondPlacePoints": standings[1].total,
                        "thirdPlacePoints": standings[2].total,
                        "mostGameweekPoints": this._getParticipantFirstName(participants, gameweekStandings[0].league_entry),
                        "mostGameweekPointsValue": gameweekStandings[0].event_total,
                        "leastGameweekPoints": this._getParticipantFirstName(participants, gameweekStandings[gameweekStandings.length - 1].league_entry),
                        "leastGameweekPointsValue": gameweekStandings[gameweekStandings.length - 1].event_total,
                        "mostGameweekGoals": this._getNameArrayValue(mostGoalsFirstNames),
                        "mostGameweekGoalsValue": mostGoals,
                        "leastGameweekGoals": this._getNameArrayValue(leastGoalsFirstNames),
                        "leastGameweekGoalsValue": leastGoals,
                        "mostGameweekAssists": this._getNameArrayValue(mostAssistsFirstNames),
                        "mostGameweekAssistsValue": mostAssists,
                        "leastGameweekAssists": this._getNameArrayValue(leastAssistsFirstNames),
                        "leastGameweekAssistsValue": leastAssists,
                        "game1Home": "Man City",
                        "game1Away": "Arsenal",
                        "game2Home": "Man United",
                        "game2Away": "Chelsea",
                        "game3Home": "Leicester",
                        "game3Away": "Burnley",
                        "headerIcon": headerIcon,
                        "thumbsUpIcon": thumbsUpIcon,
                        "thumbsDownIcon": thumbsDownIcon,
                        "pointsIcon": pointsIcon,
                        "goalsIcon": goalsIcon,
                        "assistsIcon": assistsIcon,
                        "customUnsubscribeUrl": "https://lastofthemohigans.com/email-subscription-management?emailAddress=" + emailAddress
                    }
                ),
                Source: 'seththeekelastofthemohigans@gmail.com', // should be env var
            };
    
            try {
                let response = await ses.sendTemplatedEmail(sendEmailParams).promise();
                console.log("Successfully sent email to email address " + emailAddress);
            } catch (error) {
                console.log("Failed to send email to email address " + emailAddress);
            }
        }
    },

    sendSeasonCompletedEmail: async function(sendSeasonCompletedRequest){
        let leagueId = sendSeasonCompletedRequest.leagueId;
        let leagueDetails = await leagueDetailsDao.getLeagueDetailsById(leagueId);
        let participants = JSON.parse(leagueDetails.participants.S);
        let lastCompletedGameweek = await gameweeksDao.getLatestGameweek(leagueDetails);
        let standings = JSON.parse(lastCompletedGameweek.standings.S);

        console.log("Fetching league winner and league loser");
        // get league winner
        let leagueWinner = this._getParticipantFirstName(participants, standings[0].league_entry);
        let leagueWinnerPoints = standings[0].total;
        let leagueWinnerPointsDifference = parseInt(standings[0].total) - parseInt(standings[1].total);
        // get last place
        let lastPlace = this._getParticipantFirstName(participants, standings[standings.length - 1].league_entry);
        let lastPlacePoints = standings[standings.length - 1].total;
        let lastPlacePointsDifference = parseInt(standings[standings.length - 2].total) - parseInt(standings[standings.length - 1].total);

        let leagueMVPParticipantName = "default";
        let leagueMVPBadgeMetadata = "default";
        let leagueMVPPlayerName = "default";
        let leagueMVPValue = "default";
        let leagueTopGoalScorerBadgeParticipantName = "default";
        let leagueTopGoalScorerBadgeMetadata = "default";
        let leagueTopGoalScorerPlayerName = "default";
        let leagueTopGoalScorerValue = "default";
        let leagueTopAssisterBadgeParticipantName = "default";
        let leagueTopAssisterBadgeMetadata = "default";
        let leagueTopAssisterPlayerName = "default";
        let leagueTopAssisterScorerValue = "default";

        console.log("Fetching league mvp information");
        let leagueMVPBadgeScan = await badgesDao.getBadgesByType(leagueId, BADGE_TYPE.SEASON_MVP);
        let leagueMVPBadge = leagueMVPBadgeScan.Items[0];
        if (leagueMVPBadge){
            leagueMVPParticipantName = leagueMVPBadge.participantName.S;
            leagueMVPBadgeMetadata = JSON.parse(leagueMVPBadge.badgeMetadata.S);
            leagueMVPPlayerName = leagueMVPBadgeMetadata.player.first_name + " " + leagueMVPBadgeMetadata.player.last_name;
            leagueMVPValue = leagueMVPBadgeMetadata.value ? leagueMVPBadgeMetadata.value : "default";
        }

        console.log("Fetching golden boot info");
        let leagueTopGoalScorerBadgeScan = await badgesDao.getBadgesByType(leagueId, BADGE_TYPE.GOLDEN_BOOT);
        let leagueTopGoalScorerBadge = leagueTopGoalScorerBadgeScan.Items[0];
        if (leagueTopGoalScorerBadge) {
            leagueTopGoalScorerBadgeParticipantName = leagueTopGoalScorerBadge.participantName.S;
            leagueTopGoalScorerBadgeMetadata = JSON.parse(leagueTopGoalScorerBadge.badgeMetadata.S);
            leagueTopGoalScorerPlayerName = leagueTopGoalScorerBadgeMetadata.player.first_name + " " + leagueTopGoalScorerBadgeMetadata.player.last_name;
            leagueTopGoalScorerValue = leagueTopGoalScorerBadgeMetadata.value ? leagueTopGoalScorerBadgeMetadata.value : "default";
        }
        
        console.log("Fetching playmaker info");
        let leagueTopAssisterBadgeScan = await badgesDao.getBadgesByType(leagueId, BADGE_TYPE.PLAYMAKER_OF_THE_SEASON_WINNER);
        let leagueTopAssisterBadge = leagueTopAssisterBadgeScan.Items[0];
        if (leagueTopAssisterBadge) {
            leagueTopAssisterBadgeParticipantName = leagueTopAssisterBadge.participantName.S;
            leagueTopAssisterBadgeMetadata = JSON.parse(leagueTopGoalScorerBadge.badgeMetadata.S);
            leagueTopAssisterPlayerName = leagueTopAssisterBadgeMetadata.player.first_name + " " + leagueTopAssisterBadgeMetadata.player.last_name;
            leagueTopAssisterScorerValue = leagueTopAssisterBadgeMetadata.value ? leagueTopAssisterBadgeMetadata.value : "default";;
        }

        console.log("Building and sending email...");
        let emailAddresses = await emailSubscriptionsDao.getAllSubscriptions();
        for (let i in emailAddresses.Items) {
            let emailAddress = emailAddresses.Items[i].emailAddress.S;
            let sendEmailParams = {
                Destination: {
                  ToAddresses: [
                    emailAddress,
                  ]
                },
                Template: 'SeasonCompleted', // should be env var
                TemplateData: JSON.stringify(
                    {
                        leagueWinner,
                        leagueWinnerPoints,
                        leagueWinnerPointsDifference,
                        lastPlace,
                        lastPlacePoints,
                        lastPlacePointsDifference,
                        leagueMVPParticipantName,
                        leagueMVPPlayerName,
                        leagueMVPValue,
                        leagueTopGoalScorerBadgeParticipantName,
                        leagueTopGoalScorerPlayerName,
                        leagueTopGoalScorerValue,
                        leagueTopAssisterBadgeParticipantName,
                        leagueTopAssisterPlayerName,
                        leagueTopAssisterScorerValue,
                        headerIcon,
                        leagueTrophyIcon,
                        goldenBootIcon,
                        playmakerIcon,
                        seasonLoserIcon,
                        seasonMVPIcon,
                        "customUnsubscribeUrl": "https://lastofthemohigans.com/email-subscription-management?emailAddress=" + emailAddress
                    }
                ),
                Source: 'seththeekelastofthemohigans@gmail.com', // should be env var
            };
    
            try {
                let response = await ses.sendTemplatedEmail(sendEmailParams).promise();
                console.log(response);
                console.log("Successfully sent email to email address " + emailAddress);
            } catch (error) {
                console.log("Failed to send email to email address " + emailAddress);
                console.log(JSON.stringify(error));
            }
        }

        return {
            leagueWinner,
            leagueWinnerPoints,
            leagueWinnerPointsDifference,
            lastPlace,
            lastPlacePoints,
            lastPlacePointsDifference,
            leagueMVPParticipantName,
            leagueMVPPlayerName,
            leagueMVPValue,
            leagueTopGoalScorerBadgeParticipantName,
            leagueTopGoalScorerPlayerName,
            leagueTopGoalScorerValue,
            leagueTopAssisterBadgeParticipantName,
            leagueTopAssisterPlayerName,
            leagueTopAssisterScorerValue
        }
    },

    subscribe: async function(emailAddress){
        console.log("Beginning to subscribe email address " + emailAddress);
        if (this._validateEmail(emailAddress)) {
            let response = await emailSubscriptionsDao.addEmailAddress(emailAddress);
            return response;
        }
        throw new Error("Invalid email address");
    },

    unSubscribe: async function(emailAddress){
        console.log("Beginning to unsubscribe email address " + emailAddress);
        let response = await emailSubscriptionsDao.removeEmailAddress(emailAddress)
        return response;
    },

    _validateEmail: function(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(String(email).toLowerCase());
    },

    _getParticipantFirstName: function(participants, participantId) {
        for (let i in participants) {
            let participant = participants[i];
            if (participant.id.toString() === participantId.toString()) {
                return participant.player_first_name;
            }
        }
    },

    _getParticipantFirstNameByEntryId: function(participants, entryId) {
        for (let i in participants) {
            let participant = participants[i];
            if (participant.entry_id.toString() === entryId.toString()) {
                return participant.player_first_name;
            }
        }
    },

    _getNameArrayValue: function(nameArray) {
        if (nameArray.length > 3) {
            return nameArray.length + "-way tie"
        }
        return nameArray.join(", ");
    }
}