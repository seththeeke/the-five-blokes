class PageViewService {
    constructor(amplifyRequestService, apiName) {
      this.amplifyRequestService = amplifyRequestService;
      this.apiName = apiName;
    }
  
    incrementPageView(title, owner) {
        return this.amplifyRequestService.request(this.apiName, '/blogs', "POST", {
            body: {
                "title": title,
                "owner": owner
            }
        });
    }
  
  }
  
  export default PageViewService;