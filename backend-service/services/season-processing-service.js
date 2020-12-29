var fplDraftService = require('./fpl-draft-service');
var playerLeagueDataDao = require('./../dao/player-league-data-dao');

module.exports = {
    extractSeasonData: async function(extractSeasonDataRequest){
        // Bootstrap Static
        // https://draft.premierleague.com/api/bootstrap-static - Can also be fetched from S3 based
        let bootstrapStatic = await fplDraftService.getBootstapStatic();
        let players = bootstrapStatic.elements;
        // League Details
        // https://draft.premierleague.com/api/league/11133/details
        // Top Elements
        // https://draft.premierleague.com/api/top-elements
        // All transactions
        // https://draft.premierleague.com/api/draft/league/11133/transactions
        // Fixture and Player history for season given player id
        // https://draft.premierleague.com/api/element-summary/254
        let response = await fplDraftService.getBootstapStatic();
        try {
            let results = await playerLeagueDataDao.insertPlayer(1, "Seth", "Theeke", 1, 1);
            console.log(JSON.stringify(results));
        } catch (err){
            return err;
        }
        return extractSeasonDataRequest;
    }
}