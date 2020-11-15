import React from 'react';
import './App.css';
import AppRouter from './components/AppRouter.js';
import { BrowserRouter as Router } from "react-router-dom";
import FPLService from './services/FPLService.js';
import AmplifyRequestService from './services/AmplifyRequestService.js';
import github from "./img/github.png";
// AWS Amplify Imports
import Amplify from "aws-amplify";
import config from "./aws-exports";
Amplify.configure(config);

class App extends React.Component {
  constructor(props){
    super(props);
    this.fplServiceApiName = "FPLServiceProdRaw";
    this.amplifyRequestService = new AmplifyRequestService();
    this.fplService = new FPLService(this.amplifyRequestService, this.fplServiceApiName);
  }

  render(){
    return (
      <div className="App">
        <Router>
          <AppRouter
            fplService={this.fplService}
          ></AppRouter>
          <div>
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/seththeeke/last-of-the-mohigans">
              <img className="icon" alt="github" src={github}></img>
            </a>
          </div>
        </Router>
      </div>
    );
  }
  
}

export default App;