class EmailSubscriptionService {
    constructor(amplifyRequestService, apiName) {
      this.amplifyRequestService = amplifyRequestService;
      this.apiName = apiName;
    }
  
    subscribe(emailAddress) {
        return this.amplifyRequestService.request(this.apiName, '/emails', "POST", {
            body: {
                "emailAddress": emailAddress
            }
        });
    }
  
    unsubscribe(emailAddress) {
        return this.amplifyRequestService.request(this.apiName, '/emails', "DELETE", {
            body: {
                "emailAddress": emailAddress
            }
        });
    }
  
  }
  
  export default EmailSubscriptionService;