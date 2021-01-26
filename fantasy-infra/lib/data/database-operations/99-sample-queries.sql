-- Get all season data for a team by team id by joining team info with team season data
SELECT team_season_data.*,teams.name FROM teams INNER JOIN team_season_data ON teams.team_id = team_season_data.team_id AND teams.team_id = 22 AND team_season_data.league_year = "2020/2021";
-- Get all fixture data for a player id with player information
select SUM(player_fixtures.goals),players.* from player_fixtures inner join players on players.player_id = player_fixtures.player_id and player_fixtures.player_id = 249;
-- Get all players with their sum of goals grouped by playerId
select player_id,SUM(goals) from player_fixtures group by player_id;
-- Returns top ten goal scorers from 2020/2021 and their names
select player_fixtures.player_id,SUM(player_fixtures.goals) as total_goals,players.first_name,players.last_name,player_season_data.foreign_id from player_fixtures inner join players on players.player_id = player_fixtures.player_id inner join player_season_data on player_season_data.player_id = player_fixtures.player_id and fixture_year = "2020/2021" group by player_id order by total_goals desc limit 10;
-- Returns top ten assisters from 2020/2021 and their names
select player_fixtures.player_id,SUM(player_fixtures.assists) as total_assists,players.first_name,players.last_name from player_fixtures inner join players on players.player_id = player_fixtures.player_id and fixture_year = "2020/2021" group by player_id order by total_assists desc limit 10;
-- Returns top 10 clean sheet goalkeepers from 2020/2021 and their names
select player_fixtures.player_id,SUM(player_fixtures.clean_sheets) as total_clean_sheets,players.first_name,players.last_name,players.position_id from player_fixtures inner join players on players.player_id = player_fixtures.player_id and fixture_year = "2020/2021" and players.position_id = 1 group by player_id order by total_clean_sheets desc limit 10;
-- Returns all wins for arsenal in 2020/2021
select gameweek,home_team_goals,away_team_goals,date_played from fixtures where (home_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" and home_team_goals > away_team_goals) or (away_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" and away_team_goals > home_team_goals) and fixture_year = "2020/2021" order by gameweek;
-- Select many column statistics across all fixtures for a single team_id and fixture_year
SELECT distinct name,
    (SELECT COUNT(*) FROM fixtures WHERE fixture_year = "2020/2021" and home_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" or away_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98") as games_played,
    (SELECT COUNT(*) FROM fixtures WHERE (fixture_year = "2020/2021" and (home_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" and home_team_goals > away_team_goals) or (away_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" and away_team_goals > home_team_goals))) as wins,
    (SELECT COUNT(*) FROM fixtures WHERE (fixture_year = "2020/2021" and (home_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" and home_team_goals < away_team_goals) or (away_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" and away_team_goals < home_team_goals))) as losses,
    (SELECT COUNT(*) FROM fixtures WHERE (fixture_year = "2020/2021" and (home_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" and home_team_goals = away_team_goals) or (away_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" and away_team_goals = home_team_goals))) as ties,
    (SELECT SUM(home_team_goals) FROM fixtures WHERE fixture_year = "2020/2021" and home_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98") as home_goals_scored,
    (SELECT SUM(away_team_goals) FROM fixtures WHERE fixture_year = "2020/2021" and away_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98") as away_goals_scored,
    (SELECT SUM(away_team_goals) FROM fixtures WHERE fixture_year = "2020/2021" and home_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98") as home_goals_conceded,
    (SELECT SUM(home_team_goals) FROM fixtures WHERE fixture_year = "2020/2021" and away_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98") as away_goals_conceded,
    (SELECT COUNT(*) FROM fixtures WHERE fixture_year = "2020/2021" and home_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" and away_team_goals = 0) as home_clean_sheets,
    (SELECT COUNT(*) FROM fixtures WHERE fixture_year = "2020/2021" and away_team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98" and home_team_goals = 0) as away_clean_sheets
FROM fixtures inner join teams on teams.team_id = "acc64fc9-2077-4669-a2a4-2ec345b30a98";