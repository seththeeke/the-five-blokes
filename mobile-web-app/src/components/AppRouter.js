import React from 'react';
import {
  Switch,
  Route
} from "react-router-dom";
import Home from './Home';
import EmailSubscriptionManagementPage from './EmailSubscriptionManagementPage';
import Podcast from './Podcast';
import Fantasy from './Fantasy';

class AppRouter extends React.Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route path="/home">
                        <Home
                            fplService={this.props.fplService}
                        >
                        </Home>
                    </Route>
                    <Route path="/podcast">
                        <Podcast
                            fplService={this.props.fplService}
                        >
                        </Podcast>
                    </Route>
                    <Route path="/fantasy">
                        <Fantasy
                            fplService={this.props.fplService}
                        >
                        </Fantasy>
                    </Route>
                    <Route path="/email-subscription-management">
                        <EmailSubscriptionManagementPage
                            emailSubscriptionService={this.props.emailSubscriptionService}
                        >
                        </EmailSubscriptionManagementPage>
                    </Route>
                    <Route path="/">
                        <Home
                            fplService={this.props.fplService}
                        >
                        </Home>
                    </Route>
                </Switch>
            </div>
        );
    }
}

export default AppRouter;