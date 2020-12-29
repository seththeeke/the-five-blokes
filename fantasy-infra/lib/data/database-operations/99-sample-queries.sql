-- Get all season data for a team by team id by joining team info with team season data
SELECT team_season_data.*,teams.name FROM teams INNER JOIN team_season_data ON teams.team_id = team_season_data.team_id AND teams.team_id = 22 AND team_season_data.league_year = "2020/2021";
-- Get all fixture data for a player id with player information
select SUM(player_fixtures.goals),players.* from player_fixtures inner join players on players.player_id = player_fixtures.player_id and player_fixtures.player_id = 249;