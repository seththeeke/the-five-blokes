var mysql = require('mysql2/promise');
var { v4: uuidv4 } = require('uuid');
var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var rdsdataservice = new AWS.RDSDataService({apiVersion: '2018-08-01'});
var foreignIdToTeamIdCache = {};
var foreignIdToFixtureCache = {};
var foreignIdToPlayerIdCache = {};

module.exports = {

    getTeamByTeamName: async function(name) {
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('SELECT DISTINCT * FROM teams WHERE name = ?', [name]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    getTeamIdByForeignId: async function(foreign_id){
        let connection = await this.createConnection();
        try {
            if (!foreignIdToTeamIdCache[foreign_id]) {
                let results = await connection.execute('SELECT team_id FROM team_season_data where foreign_id = ?;', [foreign_id]);
                foreignIdToTeamIdCache[foreign_id] = results;
            }
            await connection.end();
            return foreignIdToTeamIdCache[foreign_id];
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    getPlayerIdByForeignId: async function(foreign_id){
        let connection = await this.createConnection();
        try {
            if (!foreignIdToPlayerIdCache[foreign_id]) {
                let results = await connection.execute('SELECT player_id FROM player_season_data where foreign_id = ?;', [foreign_id]);
                foreignIdToPlayerIdCache[foreign_id] = results;
            } 
            await connection.end();
            return foreignIdToPlayerIdCache[foreign_id];
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    getFixtureByForeignId: async function(foreign_id){
        let connection = await this.createConnection();
        try {
            if (!foreignIdToFixtureCache[foreign_id]) {
                let results = await connection.execute('SELECT fixture_id,gameweek FROM fixtures where foreign_id = ?;', [foreign_id]);
                foreignIdToFixtureCache[foreign_id] = results;
            } 
            await connection.end();
            return foreignIdToFixtureCache[foreign_id];
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    upsertTeam: async function(name, founded_year) {
        let sql = 'INSERT INTO teams (team_id, name) VALUES (:teamId,:name) ON DUPLICATE KEY UPDATE name=:name';
        let injectedParamaters = [
            {
                name: 'teamId',
                value: {
                  stringValue: uuidv4()
                }
            },
            {
                name: 'name',
                value: {
                    stringValue: name
                }
            }
        ];
        if (founded_year && founded_year != -1){
            injectedParamaters.push(
                {
                    name: 'foundedYear',
                    typeHint: "DATE",
                    value: {
                        stringValue: founded_year
                    }
                }
            );
            sql = 'INSERT INTO teams (team_id, name, founded_year) VALUES (:teamId,:name,:foundedYear) ON DUPLICATE KEY UPDATE name=:name,founded_year=:foundedYear';
        }
        var params = {
            resourceArn: process.env.RDS_CLUSTER_ARN,
            secretArn: process.env.RDS_SECRET_ARN,
            sql: sql,
            continueAfterTimeout: false,
            database: process.env.DATABASE_NAME,
            includeResultMetadata: true,
            parameters: injectedParamaters
        };
        let results = await rdsdataservice.executeStatement(params).promise();
        return results;
    },

    upsertTeamSeasonData: async function(foreign_id, team_id, league_year, rank, wins, loses, ties, points) {
        let sql = 'INSERT INTO team_season_data (team_season_id, foreign_id, team_id, league_year, rank, wins, loses, ties, points) VALUES (:teamSeasonId, :foreignId, :teamId, :leagueYear, :rank, :wins, :loses, :ties, :points) ON DUPLICATE KEY UPDATE rank=:rank, wins=:wins, loses=:loses, ties=:ties, points=:points';
        let injectedParamaters = [
            {
                name: 'teamSeasonId',
                value: {
                  stringValue: uuidv4()
                }
            },
            {
                name: 'foreignId',
                value: {
                    stringValue: foreign_id.toString()
                }
            },
            {
                name: 'teamId',
                value: {
                    stringValue: team_id.toString()
                }
            },
            {
                name: 'leagueYear',
                value: {
                    stringValue: league_year
                }
            },
            {
                name: 'rank',
                value: {
                    stringValue: rank ? rank.toString() : "0"
                }
            },
            {
                name: 'wins',
                value: {
                    stringValue: wins ? wins.toString() : "0"
                }
            },
            {
                name: 'loses',
                value: {
                    stringValue: loses ? loses.toString() : "0"
                }
            },
            {
                name: 'ties',
                value: {
                    stringValue: ties ? ties.toString() : "0"
                }
            },
            {
                name: 'points',
                value: {
                    stringValue: points ? points.toString() : "0"
                }
            }
        ];
        var params = {
            resourceArn: process.env.RDS_CLUSTER_ARN,
            secretArn: process.env.RDS_SECRET_ARN,
            sql: sql,
            continueAfterTimeout: false,
            database: process.env.DATABASE_NAME,
            includeResultMetadata: true,
            parameters: injectedParamaters
        };
        let results = await rdsdataservice.executeStatement(params).promise();
        return results;
    },

    insertPlayer: async function(position_id, first_name, last_name, foreign_team_id){
        let sql = 'INSERT INTO players (player_id, position_id, first_name, last_name, foreign_team_id) VALUES (:playerId, :positionId, :firstName, :lastName, :foreignTeamId)';
        let injectedParamaters = [
            {
                name: 'playerId',
                value: {
                  stringValue: uuidv4()
                }
            },
            {
                name: 'positionId',
                value: {
                    stringValue: position_id.toString()
                }
            },
            {
                name: 'firstName',
                value: {
                    stringValue: first_name
                }
            },
            {
                name: 'lastName',
                value: {
                    stringValue: last_name
                }
            },
            {
                name: 'foreignTeamId',
                value: {
                    stringValue: foreign_team_id.toString()
                }
            }
        ];
        var params = {
            resourceArn: process.env.RDS_CLUSTER_ARN,
            secretArn: process.env.RDS_SECRET_ARN,
            sql: sql,
            continueAfterTimeout: false,
            database: process.env.DATABASE_NAME,
            includeResultMetadata: true,
            parameters: injectedParamaters
        };
        let results = await rdsdataservice.executeStatement(params).promise();
        return results;
    },

    upsertPlayerSeasonData: async function(foreign_id, player_id, league_year){
        let sql = 'INSERT INTO player_season_data (player_season_id, foreign_id, player_id, league_year) VALUES (:playerSeasonId, :foreignId, :playerId, :leagueYear) ON DUPLICATE KEY UPDATE player_id=:playerId';
        let injectedParamaters = [
            {
                name: 'playerSeasonId',
                value: {
                  stringValue: uuidv4()
                }
            },
            {
                name: 'foreignId',
                value: {
                    stringValue: foreign_id.toString()
                }
            },
            {
                name: 'playerId',
                value: {
                    stringValue: player_id.toString()
                }
            },
            {
                name: 'leagueYear',
                value: {
                    stringValue: league_year
                }
            }
        ];
        var params = {
            resourceArn: process.env.RDS_CLUSTER_ARN,
            secretArn: process.env.RDS_SECRET_ARN,
            sql: sql,
            continueAfterTimeout: false,
            database: process.env.DATABASE_NAME,
            includeResultMetadata: true,
            parameters: injectedParamaters
        };
        let results = await rdsdataservice.executeStatement(params).promise();
        return results;
    },

    upsertFixture: async function(foreign_id, away_team_id, home_team_id, date_played, fixture_year, home_team_goals, away_team_goals, gameweek){
        let sql = 'INSERT INTO fixtures (fixture_id, foreign_id, away_team_id, home_team_id, date_played, fixture_year, home_team_goals, away_team_goals, gameweek) VALUES (:fixtureId, :foreignId, :awayTeamId, :homeTeamId, :datePlayed, :fixtureYear, :homeTeamGoals, :awayTeamGoals, :gameweek) ON DUPLICATE KEY UPDATE foreign_id= :foreignId';
        let monthValue = (parseInt(date_played.getMonth()) + 1) >= 10 ? (parseInt(date_played.getMonth()) + 1).toString() : "0" + (parseInt(date_played.getMonth()) + 1).toString();
        let dateValue = (parseInt(date_played.getDate())) >= 10 ? (parseInt(date_played.getDate())).toString() : "0" + (parseInt(date_played.getDate())).toString();
        let stringDate = (date_played.getFullYear() + "-" + monthValue + "-" + dateValue).toString();
        let injectedParamaters = [
            {
                name: 'fixtureId',
                value: {
                  stringValue: uuidv4()
                }
            },
            {
                name: 'foreignId',
                value: {
                    stringValue: foreign_id.toString()
                }
            },
            {
                name: 'awayTeamId',
                value: {
                    stringValue: away_team_id.toString()
                }
            },
            {
                name: 'homeTeamId',
                value: {
                    stringValue: home_team_id.toString()
                }
            },
            {
                name: 'datePlayed',
                typeHint: "DATE",
                value: {
                    stringValue: stringDate
                }
            },
            {
                name: 'fixtureYear',
                value: {
                    stringValue: fixture_year
                }
            },
            {
                name: 'homeTeamGoals',
                value: {
                    stringValue: home_team_goals.toString()
                }
            },
            {
                name: 'awayTeamGoals',
                value: {
                    stringValue: away_team_goals.toString()
                }
            },
            {
                name: 'gameweek',
                value: {
                    stringValue: gameweek.toString()
                }
            }
        ];
        var params = {
            resourceArn: process.env.RDS_CLUSTER_ARN,
            secretArn: process.env.RDS_SECRET_ARN,
            sql: sql,
            continueAfterTimeout: false,
            database: process.env.DATABASE_NAME,
            includeResultMetadata: true,
            parameters: injectedParamaters
        };
        let results = await rdsdataservice.executeStatement(params).promise();
        return results;
    },

    upsertPlayerFixture: async function(player_id, fixture_id, goals, assists, fixture_year, gameweek, clean_sheets, points, minutes_played, yellow_cards, red_cards, bonus, goals_conceded, own_goals, penalties_missed, penalties_saved, saves) {
        // need to properly handle upsert, currently ignoring update
        let sql = 'INSERT INTO player_fixtures (player_fixture_id, player_id, fixture_id, goals, assists, fixture_year, gameweek, clean_sheets, points, minutes_played, yellow_cards, red_cards, bonus, goals_conceded, own_goals, penalties_missed, penalties_saved, saves) VALUES (:playerFixtureId, :playerId, :fixtureId, :goals, :assists, :fixtureYear, :gameweek, :cleanSheets, :points, :minutesPlayed, :yellowCards, :redCards, :bonus, :goalsConceded, :ownGoals, :penaltiesMissed, :penaltiesSaved, :saves) ON DUPLICATE KEY UPDATE fixture_id= :fixtureId';
        let injectedParamaters = [
            {
                name: 'playerFixtureId',
                value: {
                  stringValue: uuidv4()
                }
            },
            {
                name: 'playerId',
                value: {
                    stringValue: player_id.toString()
                }
            },
            {
                name: 'fixtureId',
                value: {
                    stringValue: fixture_id.toString()
                }
            },
            {
                name: 'goals',
                value: {
                    stringValue: goals.toString()
                }
            },
            {
                name: 'assists',
                value: {
                    stringValue: assists.toString()
                }
            },
            {
                name: 'fixtureYear',
                value: {
                    stringValue: fixture_year.toString()
                }
            },
            {
                name: 'gameweek',
                value: {
                    stringValue: gameweek.toString()
                }
            },
            {
                name: 'cleanSheets',
                value: {
                    stringValue: clean_sheets.toString()
                }
            },
            {
                name: 'points',
                value: {
                    stringValue: points.toString()
                }
            },
            {
                name: 'minutesPlayed',
                value: {
                    stringValue: minutes_played.toString()
                }
            },
            {
                name: 'yellowCards',
                value: {
                    stringValue: yellow_cards.toString()
                }
            },
            {
                name: 'redCards',
                value: {
                    stringValue: red_cards.toString()
                }
            },
            {
                name: 'bonus',
                value: {
                    stringValue: bonus.toString()
                }
            },
            {
                name: 'goalsConceded',
                value: {
                    stringValue: goals_conceded.toString()
                }
            },
            {
                name: 'ownGoals',
                value: {
                    stringValue: own_goals.toString()
                }
            },
            {
                name: 'penaltiesMissed',
                value: {
                    stringValue: penalties_missed.toString()
                }
            },
            {
                name: 'penaltiesSaved',
                value: {
                    stringValue: penalties_saved.toString()
                }
            },
            {
                name: 'saves',
                value: {
                    stringValue: saves.toString()
                }
            }
        ];
        var params = {
            resourceArn: process.env.RDS_CLUSTER_ARN,
            secretArn: process.env.RDS_SECRET_ARN,
            sql: sql,
            continueAfterTimeout: false,
            database: process.env.DATABASE_NAME,
            includeResultMetadata: true,
            parameters: injectedParamaters
        };
        let results = await rdsdataservice.executeStatement(params).promise();
        return results;
    },

    getPlayerByNameAndPosition: async function(first_name, last_name, position_id) {
        let connection = await this.createConnection();
        try {
            let results = await connection.execute('SELECT DISTINCT * FROM players WHERE first_name = ? AND last_name = ? AND position_id = ?', [first_name, last_name, position_id]);
            await connection.end();
            return results;
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    getTopPlayersByStatistic: async function(columnName, season_year, position_id, limit) {
        limit = limit ? limit : 10;
        let sql = 'select player_fixtures.player_id,SUM(' + columnName + ') as total,players.first_name,players.last_name,player_season_data.foreign_id from player_fixtures inner join players on players.player_id = player_fixtures.player_id inner join player_season_data on player_season_data.player_id = player_fixtures.player_id and fixture_year = ? group by player_id order by total desc limit ?';
        let params = [season_year, limit];
        if (position_id) {
            sql = 'select player_fixtures.player_id,SUM(' + columnName + ') as total,players.first_name,players.last_name,player_season_data.foreign_id from player_fixtures inner join players on players.player_id = player_fixtures.player_id inner join player_season_data on player_season_data.player_id = player_fixtures.player_id and fixture_year = ? and position_id = ? group by player_id order by total desc limit ?';
            params = [season_year, position_id, limit];
        }
        let connection = await this.createConnection();
        try {
            let results = await connection.execute(sql, params);
            await connection.end();
            return results[0];
        } catch (err){
            await connection.end();
            throw err;
        }
    },

    getAllPlayers: async function() {
        var params = {
            resourceArn: process.env.RDS_CLUSTER_ARN,
            secretArn: process.env.RDS_SECRET_ARN,
            sql: 'SELECT * FROM players',
            database: process.env.DATABASE_NAME
        };
        let results = await rdsdataservice.executeStatement(params).promise();
        return results;
    },

    createConnection: async function() {
        let connection = await mysql.createConnection({
            host           : process.env.AURORA_DB_ENDPOINT,
            user           : process.env.USERNAME,
            password       : process.env.PASSWORD,
            database       : process.env.DATABASE_NAME,
            connectTimeout : 30000
        });
        return connection;
    }
}