var GOALKEEPER_ELEMENT_TYPE = 1;

module.exports = {
    getTopTenScorers: function(allPlayers){
        let topGoalScorers = allPlayers;
        topGoalScorers.sort(function(a, b){
            return b.goals_scored - a.goals_scored;
        });
        return topGoalScorers.slice(0, 10);
    },

    getTopTenAssisters: function(allPlayers){
        let topAssisters = allPlayers;
        topAssisters.sort(function(a, b){
            return b.assists - a.assists;
        });
        return topAssisters.slice(0, 10);
    },

    getTopTenCleanSheets: function(allPlayers){
        let topCleanSheets = allPlayers;
        topCleanSheets.sort(function(a, b){
            return b.clean_sheets - a.clean_sheets;
        });
        let goalkeepers = topCleanSheets.filter(function(player){
            return player.element_type.toString() === GOALKEEPER_ELEMENT_TYPE.toString();
        });
        return goalkeepers.slice(0, 10);
    },

    getDreamTeamPlayers: function(allPlayers){
        let dreamTeam = allPlayers;
        dreamTeam = dreamTeam.filter(function(player){
            return player.in_dreamteam;
        });
        return dreamTeam;
    }
}