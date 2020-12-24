module.exports = {
    createPlayerMap: function(filteredPlayers){
        let playerMap = {};
        for (let k in filteredPlayers){
            let player = filteredPlayers[k];
            playerMap[player.id.toString()] = player;
        }
        return playerMap;
    }
}