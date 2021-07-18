import React from 'react';
import {
  Switch,
  Route
} from "react-router-dom";
import Home from './pages/Home';
import EmailSubscriptionManagementPage from './pages/EmailSubscriptionManagementPage';
import Podcast from './pages/Podcast';
import Fantasy from './pages/Fantasy';
import FollowBlokes from './pages/FollowBlokes';

class AppRouter extends React.Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route path="/home">
                        <Home
                            fplService={this.props.fplService}
                            emailSubscriptionService={this.props.emailSubscriptionService}
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
                    <Route path="/follow">
                        <FollowBlokes
                            emailSubscriptionService={this.props.emailSubscriptionService}
                        >
                        </FollowBlokes>
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