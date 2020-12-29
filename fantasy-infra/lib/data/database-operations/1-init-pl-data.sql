CREATE DATABASE premiere_league_data;
USE premiere_league_data;
SET collation_connection = 'utf8_general_ci';
ALTER DATABASE premiere_league_data CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE TABLE players(
    player_id INT NOT NULL AUTO_INCREMENT,
    position_id INT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    foreign_team_id INT,
    PRIMARY KEY ( player_id )
);
ALTER TABLE players CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE TABLE player_season_data(
    player_season_id INT NOT NULL AUTO_INCREMENT,
    foreign_id INT NOT NULL,
    player_id INT NOT NULL,
    league_year VARCHAR(10),
    PRIMARY KEY ( player_season_id ),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);
CREATE TABLE teams(
    team_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100),
    founded_year YEAR,
    PRIMARY KEY ( team_id )
);
CREATE UNIQUE INDEX team_name_index
ON teams(name);
CREATE TABLE team_season_data(
    team_season_id INT NOT NULL AUTO_INCREMENT,
    foreign_id INT NOT NULL,
    team_id INT NOT NULL,
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
    fixture_id INT NOT NULL AUTO_INCREMENT,
    foreign_id INT NOT NULL,
    away_team_id INT NOT NULL,
    home_team_id INT NOT NULL,
    date_played DATE,
    fixture_year VARCHAR(10),
    home_team_goals INT,
    away_team_goals INT,
    gameweek INT,
    PRIMARY KEY ( fixture_id ),
    FOREIGN KEY (away_team_id) REFERENCES teams(team_id),
    FOREIGN KEY (home_team_id) REFERENCES teams(team_id)
);
CREATE UNIQUE INDEX foreign_id_fixture_year
ON fixtures(foreign_id,fixture_year);
CREATE TABLE player_fixtures(
    player_fixture_id INT NOT NULL AUTO_INCREMENT,
    player_id INT NOT NULL,
    fixture_id INT NOT NULL,
    goals INT,
    assists INT,
    fixture_year VARCHAR(10),
    gameweek INT,
    clean_sheets INT,
    points INT,
    minutes_played INT,
    yellow_cards INT,
    red_cards INT,
    PRIMARY KEY ( player_fixture_id ),
    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (fixture_id) REFERENCES fixtures(fixture_id)
);
CREATE UNIQUE INDEX player_id_fixture_id_fixture_year
ON player_fixtures(player_id,fixture_id,fixture_year);
CREATE TABLE player_transactions(
    transaction_id INT NOT NULL AUTO_INCREMENT,
    transaction_alternate_id INT,
    player_in_id INT NOT NULL,
    player_out_id INT NOT NULL,
    result VARCHAR(50),
    leagueId INT NOT NULL,
    fantasy_team_id INT NOT NULL,
    PRIMARY KEY ( transaction_id ),
    FOREIGN KEY (player_in_id) REFERENCES players(player_id),
    FOREIGN KEY (player_out_id) REFERENCES players(player_id)
);