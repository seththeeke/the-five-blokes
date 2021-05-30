class FPLService {
  constructor(amplifyRequestService, apiName) {
    this.amplifyRequestService = amplifyRequestService;
    this.apiName = apiName;
    this.fplServiceCache = {};
    this.partipantCache = undefined;
    this.latestGameweekCache = undefined;
    this.gameweekHistoryCache = undefined;
  }

  getAllParticipants() {
    if (this.partipantCache){
      return this.partipantCache;
    }
    this.partipantCache = this.amplifyRequestService.request(this.apiName, '/participants', "GET");
    return this.partipantCache;
  }

  getLatestGameweek() {
    if (this.latestGameweekCache){
      return this.latestGameweekCache;
    }
    this.latestGameweekCache = this.amplifyRequestService.request(this.apiName, '/gameweeks', "GET");
    return this.latestGameweekCache;
  }

  getStandingsHistoryForActiveLeague() {
    if (this.gameweekHistoryCache){
      return this.gameweekHistoryCache;
    }
    this.gameweekHistoryCache = this.amplifyRequestService.request(this.apiName, '/standings', "GET");
    return this.gameweekHistoryCache;
  }

}

export default FPLService;