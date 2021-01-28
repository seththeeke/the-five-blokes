CREATE TABLE player_awards(
    player_award_id VARCHAR(200) NOT NULL,
    player_id VARCHAR(200) NOT NULL,
    league_year VARCHAR(10),
    award_id INT,
    award_name INT,
    award_value INT,
    PRIMARY KEY ( player_award_id ),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);