CREATE DATABASE premiere_league_data;
USE premiere_league_data;
CREATE TABLE players(
    player_id INT NOT NULL AUTO_INCREMENT,
    position_id INT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    team_id INT,
    PRIMARY KEY ( player_id )
);
INSERT INTO players (position_id, first_name, last_name, team_id)
VALUES (1, "Seth", "Theeke", 2);
CREATE TABLE teams(
    team_id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100),
    founded_year YEAR,
    PRIMARY KEY ( team_id )
);
INSERT INTO teams (name, founded_year)
VALUES ("Arsenal", 1900);
UPDATE players
SET team_id = 1
WHERE player_id=1;
SELECT players.*,name FROM players INNER JOIN teams ON players.team_id = teams.team_id;