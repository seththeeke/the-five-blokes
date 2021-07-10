import React from 'react';
import './App.css';
import AppRouter from './components/AppRouter.js';
import { BrowserRouter as Router } from "react-router-dom";
import FPLService from './services/FPLService.js';
import EmailSubscriptionService from './services/EmailSubscriptionService.js';
import AmplifyRequestService from './services/AmplifyRequestService.js';
// AWS Amplify Imports
import Amplify from "aws-amplify";
import config from "./aws-exports";
import AppNavigation from './components/AppNavigation';
import AppHeader from './components/AppHeader';
Amplify.configure(config);

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      isMobileView: true
    }
    this.fplServiceApiName = "FPLServiceProdRaw";
    this.amplifyRequestService = new AmplifyRequestService();
    this.fplService = new FPLService(this.amplifyRequestService, this.fplServiceApiName);
    this.emailSubscriptionService = new EmailSubscriptionService(this.amplifyRequestService, this.fplServiceApiName);
  }

  componentDidMount(){
    this.setState({
      isMobileView: (window.screen.width < 667)
    });
  }

  render(){
    return (
      <div className="App">
        <Router>
          <div className="window-size-warning" hidden={this.state.isMobileView}>Wow, that's a big window, this website is optimized for mobile user experience but it will work just fine on Desktop</div>
          <AppHeader></AppHeader>
          <AppRouter
            fplService={this.fplService}
            emailSubscriptionService={this.emailSubscriptionService}
          ></AppRouter>
          <AppNavigation>
          </AppNavigation>
        </Router>
      </div>
    );
  }
  
}

export default App;