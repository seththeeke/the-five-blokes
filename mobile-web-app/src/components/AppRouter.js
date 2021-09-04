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
import WhyArsenalSucks from './blogs/WhyArsenalSucks';
import HowGoodWereTheInvincibles from './blogs/HowGoodWereTheInvincibles';
import BlokesBlogsPage from './pages/BlokesBlogsPage';
import arsenalBloke from "../img/blokes/Blokes-avatar-Seth-transparent.png";

class AppRouter extends React.Component {
    render() {
        let allBlogs = [
            {
                "url": "/why-arsenal-sucks-and-why-its-okay",
                "title": "4 Reasons Arsenal Suck and Why It's Okay",
                "publishDate": "8/28/2021",
                "author": "the-arsenal-bloke",
                "icon": arsenalBloke
            },
            {
                "url": "/how-good-were-the-invincibles",
                "title": "How Good Were The Invincibles?",
                "publishDate": "9/5/2021",
                "author": "the-arsenal-bloke",
                "icon": arsenalBloke
            }
        ];
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
                    <Route path="/bloke-blogs/why-arsenal-sucks-and-why-its-okay">
                        <WhyArsenalSucks
                            blokeIcon={arsenalBloke}
                            blokeHeader="The Arsenal Bloke"
                            pageViewService={this.props.pageViewService}
                        >
                        </WhyArsenalSucks>
                    </Route>
                    <Route path="/bloke-blogs/how-good-were-the-invincibles">
                        <HowGoodWereTheInvincibles
                            blokeIcon={arsenalBloke}
                            blokeHeader="The Arsenal Bloke"
                            pageViewService={this.props.pageViewService}
                        >
                        </HowGoodWereTheInvincibles>
                    </Route>
                    <Route path="/bloke-blogs">
                        <BlokesBlogsPage
                            blokeHeader="The Five Blokes Blogs"
                            blogContent={allBlogs}
                        >
                        </BlokesBlogsPage>
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