var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweeksDao = require('./../dao/gameweeks-dao');
var gameweekPlayerDataDao = require('./../dao/gameweek-player-history-dao');

var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ses = new AWS.SES({apiVersion: '2010-12-01'});

var MEDIA_ASSETS_BASE_URL = process.env.MEDIA_ASSETS_BUCKET_URL;
var headerIcon = MEDIA_ASSETS_BASE_URL + "/circular-prem-lion.png";
var thumbsUpIcon = MEDIA_ASSETS_BASE_URL + "/thumbs-up.png";
var thumbsDownIcon = MEDIA_ASSETS_BASE_URL + "/thumbs-down.png";
var pointsIcon = MEDIA_ASSETS_BASE_URL + "/gameweek-winner.png";
var goalsIcon = MEDIA_ASSETS_BASE_URL + "/football-ball.png";
var assistsIcon = MEDIA_ASSETS_BASE_URL + "/kick-ball.png";
var podiumImg = MEDIA_ASSETS_BASE_URL + "/podium.png";

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

        var params = {
            Destination: {
              ToAddresses: [
                'seththeeke@gmail.com',
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
                }
            ),
            Source: 'seththeekelastofthemohigans@gmail.com', // should be env var
        };

        let response = await ses.sendTemplatedEmail(params).promise();
        return response;
        // return params;
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