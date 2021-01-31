var badgesDao = require('./../dao/badges-dao');
var staticContentDao = require('./../dao/static-content-dao');
var fplDraftService = require('./../services/fpl-draft-service');
var BADGE_TYPE = require('./../util/badge-type');
var badgeProcessorUtil = require('./../util/badge-processor-util');

module.exports = {

    assignBadges: async function(assignSeasonBadgesRequest) {
        // Need to extract this information from elsewhere, unsure where, may need to do manual data input here
        // this will almost certainly need to be added manually
        // PFA Player of the Year
        // PFA Young Player of the Year

        return {
            "success": true,
            // "gameweek": gameweek
        }
    }
}