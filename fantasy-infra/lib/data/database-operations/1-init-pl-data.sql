CREATE DATABASE premiere_league_data;
USE premiere_league_data;
SET collation_connection = 'utf8_general_ci';
ALTER DATABASE premiere_league_data CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE TABLE players(
    player_id VARCHAR(200) NOT NULL,
    position_id INT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    foreign_team_id INT,
    PRIMARY KEY ( player_id )
);
ALTER TABLE players CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE TABLE player_season_data(
    player_season_id VARCHAR(200) NOT NULL,
    foreign_id INT NOT NULL,
    player_id VARCHAR(200) NOT NULL,
    league_year VARCHAR(10),
    PRIMARY KEY ( player_season_id ),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);
CREATE UNIQUE INDEX foreign_id_league_year
ON player_season_data(foreign_id,league_year);
CREATE TABLE teams(
    team_id VARCHAR(200) NOT NULL,
    name VARCHAR(100),
    founded_year YEAR,
    PRIMARY KEY ( team_id )
);
CREATE UNIQUE INDEX team_name_index
ON teams(name);
CREATE TABLE team_season_data(
    team_season_id VARCHAR(200) NOT NULL,
    foreign_id INT NOT NULL,
    team_id VARCHAR(200) NOT NULL,
    league_year VARCHAR(10) NOT NULL,
    rank INT NOT NULL,
    wins INT NOT NULL,
    loses INT NOT NULL,
    ties INT NOT NULL,
    points INT NOT NULL,
    PRIMARY KEY ( team_season_id ),
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
);
CREATE UNIQUE INDEX foreign_id_league_year
ON team_season_data(foreign_id,league_year);
CREATE TABLE fixtures(
    fixture_id VARCHAR(200) NOT NULL,
    foreign_id INT NOT NULL,
    away_team_id VARCHAR(200) NOT NULL,
    home_team_id VARCHAR(200) NOT NULL,
    date_played DATE,
    fixture_year VARCHAR(10),
    home_team_goals INT,
    away_team_goals INT,
    gameweek INT,
    PRIMARY KEY ( fixture_id ),
    FOREIGN KEY (away_team_id) REFERENCES teams(team_id),
    FOREIGN KEY (home_team_id) REFERENCES teams(team_id)
);
CREATE INDEX foreign_key_index
ON fixtures(foreign_id);
CREATE UNIQUE INDEX foreign_id_fixture_year
ON fixtures(foreign_id,fixture_year);
CREATE TABLE player_fixtures(
    player_fixture_id VARCHAR(200) NOT NULL,
    player_id VARCHAR(200) NOT NULL,
    fixture_id VARCHAR(200) NOT NULL,
    goals INT,
    assists INT,
    fixture_year VARCHAR(10),
    gameweek INT,
    clean_sheets INT,
    points INT,
    minutes_played INT,
    yellow_cards INT,
    red_cards INT,
    bonus INT,
    goals_conceded INT,
    own_goals INT,
    penalties_missed INT,
    penalties_saved INT,
    saves INT,
    PRIMARY KEY ( player_fixture_id ),
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (fixture_id) REFERENCES fixtures(fixture_id)
);
CREATE UNIQUE INDEX player_id_fixture_id_fixture_year
ON player_fixtures(player_id,fixture_id,fixture_year);