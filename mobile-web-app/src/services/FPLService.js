class FPLService {
  constructor(amplifyRequestService, apiName) {
    this.amplifyRequestService = amplifyRequestService;
    this.apiName = apiName;
    this.fplServiceCache = {};
    this.participantCache = undefined;
    this.participantIdCache = {};
    this.latestGameweekCache = undefined;
    this.latestGameweekIdCache = {};
    this.gameweekHistoryCache = undefined;
    this.gameweekHistoryLeagueIdCache = {};
    this.leagueDetailsCache = undefined;
    this.championsCache = undefined;
  }

  /**
   * Fetches participants and badges for the leagueDetails provided as optional
   * 
   * @param leagueId 
   */
  getAllParticipants(leagueId) {
    if (leagueId){
      return this.getAllParticipantsForLeagueId(leagueId);
    }
    if (this.participantCache){
      return this.participantCache;
    }
    this.participantCache = this.amplifyRequestService.request(this.apiName, '/participants', "GET");
    return this.participantCache;
  }

  getAllParticipantsForLeagueId(leagueId) {
    if (this.participantIdCache && this.participantIdCache[leagueId]){
      return this.participantIdCache[leagueId];
    }
    this.participantIdCache[leagueId] = this.amplifyRequestService.request(this.apiName, '/participants', "GET", {
      queryStringParameters: {
        leagueId: leagueId
      }
    });
    return this.participantIdCache[leagueId];
  }

  getLatestGameweek(leagueId) {
    if (leagueId){
      return this.getLatestGameweekForLeagueId(leagueId);
    }
    if (this.latestGameweekCache){
      return this.latestGameweekCache;
    }
    this.latestGameweekCache = this.amplifyRequestService.request(this.apiName, '/gameweeks', "GET");
    return this.latestGameweekCache;
  }

  getLatestGameweekForLeagueId(leagueId) {
    if (this.latestGameweekIdCache && this.latestGameweekIdCache[leagueId]){
      return this.latestGameweekIdCache[leagueId];
    }
    this.latestGameweekIdCache[leagueId] = this.amplifyRequestService.request(this.apiName, '/gameweeks', "GET", {
      queryStringParameters: {
        leagueId: leagueId
      }
    });
    return this.latestGameweekIdCache[leagueId];
  }

  getStandingsHistory(leagueId) {
    if (leagueId){
      return this.getStandingsHistoryForLeagueId(leagueId);
    }
    if (this.gameweekHistoryCache){
      return this.gameweekHistoryCache;
    }
    this.gameweekHistoryCache = this.amplifyRequestService.request(this.apiName, '/standings', "GET");
    return this.gameweekHistoryCache;
  }

  getStandingsHistoryForLeagueId(leagueId) {
    if (this.gameweekHistoryLeagueIdCache && this.gameweekHistoryLeagueIdCache[leagueId]){
      return this.gameweekHistoryLeagueIdCache[leagueId];
    }
    this.gameweekHistoryLeagueIdCache[leagueId] = this.amplifyRequestService.request(this.apiName, '/standings', "GET", {
      queryStringParameters: {
        leagueId: leagueId
      }
    });
    return this.gameweekHistoryLeagueIdCache[leagueId];
  }

  getAllLeagueDetails() {
    if (this.leagueDetailsCache){
      return this.leagueDetailsCache;
    }
    this.leagueDetailsCache = this.amplifyRequestService.request(this.apiName, '/league-details', "GET");
    return this.leagueDetailsCache;
  }

  getLeagueChampions() {
    if (this.championsCache){
      return this.championsCache;
    }
    this.championsCache = this.amplifyRequestService.request(this.apiName, '/champions', "GET");
    return this.championsCache;
  }

}

export default FPLService;