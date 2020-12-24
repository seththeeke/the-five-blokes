module.exports = {
    createPlayerMap: function(filteredPlayers){
        let playerMap = {};
        for (let k in filteredPlayers){
            let player = filteredPlayers[k];
            playerMap[player.id.toString()] = player;
        }
        return playerMap;
    },

    getTeamIdForPlayer: function(leaguePicks, playerToLookUp, playerMap){
        for (let teamId in leaguePicks) {
            let picks = leaguePicks[teamId];
            for (let i in picks){
                let player = playerMap[picks[i].element.toString()];
                if (player && player.id === playerToLookUp.id){
                    return teamId;
                }
            }
        }
    }
}