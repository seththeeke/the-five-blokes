module.exports = {
    getTopTenScorers: function(bootstrapStaticData){
        let topGoalScorers = bootstrapStaticData.data.elements;
        topGoalScorers.sort(function(a, b){
            return b.goals_scored - a.goals_scored;
        });
        return topGoalScorers.slice(0, 10);
    },

    getTopTenAssisters: function(bootstrapStaticData){
        let topAssisters = bootstrapStaticData.data.elements;
        topAssisters.sort(function(a, b){
            return b.assists - a.assists;
        });
        return topAssisters.slice(0, 10);
    },

    getTopTenCleanSheets: function(bootstrapStaticData){
        let topCleanSheets = bootstrapStaticData.data.elements;
        topCleanSheets.sort(function(a, b){
            return b.clean_sheets - a.clean_sheets;
        });
        return topCleanSheets.slice(0, 10);
    }
}