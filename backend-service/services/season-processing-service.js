var badgesDao = require('./../dao/badges-dao');
var leagueDetailsDao = require('./../dao/league-details-dao');
var fplDraftService = require('./fpl-draft-service');

module.exports = {
    extractSeasonData: async function(extractSeasonDataRequest){
        // Bootstrap Static
        // https://draft.premierleague.com/api/bootstrap-static - Can also be fetched from S3 based
        // League Details
        // https://draft.premierleague.com/api/league/11133/details
        // Top Elements
        // https://draft.premierleague.com/api/top-elements
        // All transactions
        // https://draft.premierleague.com/api/draft/league/11133/transactions
        // Fixture and Player history for season given player id
        // https://draft.premierleague.com/api/element-summary/254
        let response = await fplDraftService.getBootstapStatic();
        console.log(response);
        return extractSeasonDataRequest;
    }
}