var leagueDetailsDao = require('./../dao/league-details-dao');
var gameweeksDao = require('./../dao/gameweeks-dao');
var staticContentDao = require('./../dao/static-content-dao');
var gameweekBadgesDao = require('./../dao/badges-dao');
var gameweekPlayerDataDao = require('./../dao/gameweek-player-history-dao');
var fplDraftService = require('./fpl-draft-service');

var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ses = new AWS.SES({apiVersion: '2010-12-01'});

module.exports = {
    sendGameweekProcessingCompletedEmail: async function(){
        console.log("Beginning to form and send gameweek processing email");
        let activeLeague = await leagueDetailsDao.getActiveLeague();
        let lastCompletedGameweek = await gameweeksDao.getLatestGameweek(activeLeague);
        let allBadges = await gameweekBadgesDao.getAllBadges();

        console.log(JSON.stringify(activeLeague));
        console.log(JSON.stringify(lastCompletedGameweek));
        let participants = JSON.parse(activeLeague.participants.S);
        let standings = JSON.parse(lastCompletedGameweek.standings.S);
        let gameweek = lastCompletedGameweek.gameweek.N;

        // "standings": {
        //     "S": "[{\"event_total\":58,\"last_rank\":2,\"league_entry\":209662,\"rank\":1,\"rank_sort\":1,\"total\":374},{\"event_total\":47,\"last_rank\":1,\"league_entry\":166334,\"rank\":2,\"rank_sort\":2,\"total\":372},{\"event_total\":36,\"last_rank\":3,\"league_entry\":116756,\"rank\":3,\"rank_sort\":3,\"total\":320},{\"event_total\":28,\"last_rank\":4,\"league_entry\":165252,\"rank\":4,\"rank_sort\":4,\"total\":308},{\"event_total\":53,\"last_rank\":8,\"league_entry\":156040,\"rank\":5,\"rank_sort\":5,\"total\":303},{\"event_total\":36,\"last_rank\":5,\"league_entry\":38803,\"rank\":6,\"rank_sort\":6,\"total\":298},{\"event_total\":34,\"last_rank\":7,\"league_entry\":207715,\"rank\":7,\"rank_sort\":7,\"total\":292},{\"event_total\":28,\"last_rank\":6,\"league_entry\":155849,\"rank\":8,\"rank_sort\":8,\"total\":287},{\"event_total\":40,\"last_rank\":10,\"league_entry\":165985,\"rank\":9,\"rank_sort\":9,\"total\":266},{\"event_total\":18,\"last_rank\":9,\"league_entry\":154148,\"rank\":10,\"rank_sort\":10,\"total\":260}]"
        // },
        // "gameweek": {
        //     "N": "8"
        // }

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
                    "podiumImg": "https://lastofthemohigans-test-media.s3.amazonaws.com/img/podium.png",
                    "firstPlace": this._getParticipantFirstName(participants, standings[0].league_entry),
                    "secondPlace": this._getParticipantFirstName(participants, standings[1].league_entry),
                    "thirdPlace": this._getParticipantFirstName(participants, standings[2].league_entry),
                    "firstPlacePoints": standings[0].total,
                    "secondPlacePoints": standings[1].total,
                    "thirdPlacePoints": standings[2].total,
                    "mostGameweekPoints": "Seth",
                    "mostGameweekPointsValue": "75",
                    "leastGameweekPoints": "Nathan",
                    "leastGameweekPointsValue": "12",
                    "mostGameweekGoals": "Evan",
                    "mostGameweekGoalsValue": "7",
                    "leastGameweekGoals": "Jordan",
                    "leastGameweekGoalsValue": "0",
                    "mostGameweekAssists": "Liam",
                    "mostGameweekAssistsValue": "10",
                    "leastGameweekAssists": "Amine",
                    "leastGameweekAssistsValue": "2",
                    "game1Home": "Man City",
                    "game1Away": "Arsenal",
                    "game2Home": "Man United",
                    "game2Away": "Chelsea",
                    "game3Home": "Leicester",
                    "game3Away": "Burnley",
                    "headerIcon": "https://lastofthemohigans-test-media.s3.amazonaws.com/img/circular-prem-lion.png",
                    "thumbsUpIcon": "https://lastofthemohigans-test-media.s3.amazonaws.com/img/icons-scaffolding/thumbs-up.png",
                    "thumbsDownIcon": "https://lastofthemohigans-test-media.s3.amazonaws.com/img/icons-scaffolding/thumbs-down.png",
                    "pointsIcon": "https://lastofthemohigans-test-media.s3.amazonaws.com/img/gameweek-winner.png",
                    "goalsIcon": "https://lastofthemohigans-test-media.s3.amazonaws.com/img/icons-scaffolding/football-ball.png",
                    "assistsIcon": "https://lastofthemohigans-test-media.s3.amazonaws.com/img/icons-scaffolding/kick-ball.png"
                }
            ),
            Source: 'seththeekelastofthemohigans@gmail.com', // should be env var
        };

        let response = await ses.sendTemplatedEmail(params).promise();
        return response;
        // return params;
    },

    _getParticipantFirstName: function(participants, entryId) {
        for (let i in participants) {
            let participant = participants[i];
            if (participant.id.toString() === entryId.toString()) {
                return participant.player_first_name;
            }
        }
    }
}