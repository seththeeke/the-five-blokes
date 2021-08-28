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
import BlokeBlogPage from './pages/BlokeBlogPage';
import arsenalBloke from "../img/blokes/Blokes-avatar-Seth-transparent.png";
import chelseaBloke from "../img/blokes/Blokes-avatar-Nathan-transparent.png";
import liverpoolBloke from "../img/blokes/Blokes-avatar-Nima-transparent.png";
import manUnitedBloke from "../img/blokes/Blokes-avatar-Evan-transparent.png";
import barcelonaBloke from "../img/blokes/Blokes-avatar-Amine-transparent.png";

class AppRouter extends React.Component {
    render() {
        let arsenalBlokeBlogs = [
            {
                "url": "/why-arsenal-sucks-and-why-its-okay",
                "title": "4 Reasons Arsenal Suck and Why It's Okay",
                "publishDate": "8/28/2021"
            }
        ]
        let chelseaBlokeBlogs = []
        let liverpoolBlokeBlogs = []
        let manUnitedBlokeBlogs = []
        let barcelonaBlokeBlogs = []
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
                    <Route path="/arsenal-bloke/why-arsenal-sucks-and-why-its-okay">
                        <WhyArsenalSucks
                            blokeIcon={arsenalBloke}
                            blokeHeader="The Arsenal Bloke"
                            spotifyEpisode="https://open.spotify.com/embed/episode/7pv1EWO6y8CqXBRNtxm52W"
                            pageViewService={this.props.pageViewService}
                        >
                        </WhyArsenalSucks>
                    </Route>
                    <Route path="/arsenal-bloke">
                        <BlokeBlogPage
                            blokeIcon={arsenalBloke}
                            blokeHeader="The Arsenal Bloke"
                            blogContent={arsenalBlokeBlogs}
                        >
                        </BlokeBlogPage>
                    </Route>
                    <Route path="/chelsea-bloke">
                        <BlokeBlogPage
                            blokeIcon={chelseaBloke}
                            blokeHeader="The Chelsea Bloke"
                            blogContent={chelseaBlokeBlogs}
                        >
                        </BlokeBlogPage>
                    </Route>
                    <Route path="/liverpool-bloke">
                        <BlokeBlogPage
                            blokeIcon={liverpoolBloke}
                            blokeHeader="The Liverpool Bloke"
                            blogContent={liverpoolBlokeBlogs}
                        >
                        </BlokeBlogPage>
                    </Route>
                    <Route path="/man-united-bloke">
                        <BlokeBlogPage
                            blokeIcon={manUnitedBloke}
                            blokeHeader="The Man United Bloke"
                            blogContent={manUnitedBlokeBlogs}
                        >
                        </BlokeBlogPage>
                    </Route>
                    <Route path="/barcelona-bloke">
                        <BlokeBlogPage
                            blokeIcon={barcelonaBloke}
                            blokeHeader="The Barcelona Bloke"
                            blogContent={barcelonaBlokeBlogs}
                        >
                        </BlokeBlogPage>
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