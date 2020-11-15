var seasonBadgeProcessor = require('./../season-badge-processors/season-badge-processor');

exports.assignSeasonBadgesHandler = async (event) => {
    console.log(JSON.stringify(event));
    let assignSeasonBadgesRequest = {
        "gameweek": event.gameweek,
        "filteredPlayerDataKey": event.filteredPlayerDataKey,
        "gameweekData": event.gameweekData,
        "leagueGameweekData": event.leagueGameweekData,
        "leaguePicks": event.leaguePicks
    }
    let response = await seasonBadgeProcessor.assignSeasonBadges(assignSeasonBadgesRequest);
    return response;
}