import React from 'react';
import './../css/EmailSubscriptionManagement.css';
import EmailManagementWidget from './EmailManagementWidget';
import CircularProgress from '@material-ui/core/CircularProgress';
import nateHead from './../img/nate-head.png';
import sethHead from './../img/seth-head.png';
import evanHead from './../img/evan-head.png';
import amineHead from './../img/amine-head.png';
import nimaHead from './../img/nima-head.png';
import instagram from './../img/instagram.png';
import facebook from './../img/facebook.png';
import snapchat from './../img/snapchat.png';
import linkedin from './../img/linkedin.png';
import twitter from './../img/twitter.png';

class EmailSubscriptionManagementPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoadingWebsite: true,
            fiveBlokes: []
        }

        this._shuffleBlokes = this._shuffleBlokes.bind(this);
    }

    componentDidMount(){
        var fiveBlokesInfo = [
            {
                name: "Nathan",
                headLogo: nateHead,
                socials: [
                    {
                        link: "https://www.instagram.com/esthersyute/",
                        logo: instagram
                    },
                    {
                        link: "https://www.linkedin.com/in/nathan-lawer-yolar-73106997/",
                        logo: linkedin
                    }
                ]
            },
            {
                name: "Seth",
                headLogo: sethHead,
                socials: [
                    {
                        link: "https://www.instagram.com/seth.theeke/",
                        logo: instagram
                    },
                    {
                        link: "https://www.facebook.com/seththeeke/",
                        logo: facebook
                    },
                    {
                        link: "https://www.linkedin.com/in/sptheeke/",
                        logo: linkedin
                    }
                ]
            },
            {
                name: "Nima",
                headLogo: nimaHead,
                socials: [
                    {
                        link: "https://www.instagram.com/nronaghi/",
                        logo: instagram
                    },
                    {
                        link: "https://www.facebook.com/nima.ronaghi.1",
                        logo: facebook
                    },
                    {
                        link: "https://www.linkedin.com/in/nima-ronaghi/",
                        logo: linkedin
                    }
                ]
            },
            {
                name: "Evan",
                headLogo: evanHead,
                socials: [
                    {
                        link: "https://www.facebook.com/evan.stalnaker.7",
                        logo: facebook
                    },
                    {
                        link: "https://www.linkedin.com/in/evan-stalnaker-0a052a8b/",
                        logo: linkedin
                    }
                ]
            },
            {
                name: "Amine",
                headLogo: amineHead,
                socials: [
                    {
                        link: "https://www.linkedin.com/in/amine-feliachi-945ba2140/",
                        logo: linkedin
                    }
                ]
            },
        ]
        let blokesInfo = [];
        // So the same bloke isn't always first
        let shuffledBlokes = this._shuffleBlokes(fiveBlokesInfo);
        for (let index in shuffledBlokes){
            let bloke = shuffledBlokes[index];
            let socials = bloke.socials;
            let socialsElements = [];
            for (let j in socials){
                let social = socials[j];
                let uniqueKey = social.name + social.logo;
                socialsElements.push(
                    <a href={social.link} key={uniqueKey}>
                        <img className="social-media-logo" src={social.logo} alt="linkedin"></img>
                    </a>
                )
            }
            blokesInfo.push(
                <div key={bloke.name} className="follow-bloke-container">
                    <img className="head" src={bloke.headLogo} alt="nate-head"></img>
                    <div className="bloke-name">{bloke.name}</div>
                    {socialsElements}
                </div>
            );
        }
        this.setState({
            isLoadingWebsite: false,
            blokesInfo: blokesInfo
        });
    }

    _shuffleBlokes(blokes){
        let copy = [];
        for (let i in blokes){
            copy.push(blokes[i]);
        }
        let shuffledBlokes = [];
        while (copy.length > 0){
            let randomIndex = Math.floor(Math.random()*copy.length);
            shuffledBlokes.push(copy[randomIndex]);
            copy.splice(randomIndex, 1);
        }
        return shuffledBlokes;
    }

    render() {
        return (
            <div className='email-subscription-container'>
                <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
                    <CircularProgress></CircularProgress>
                </div>
                <div>
                    <div className="follow-the-blokes-text">Follow The Blokes</div>
                    {this.state.blokesInfo}
                </div>
                <div>
                    <EmailManagementWidget
                        emailSubscriptionService={this.props.emailSubscriptionService}
                    >
                    </EmailManagementWidget>
                    <div className="email-subscription-info">
                        By subscribing, you will get one <a href="https://github.com/seththeeke/last-of-the-mohigans#emails">email</a> each week and one at the end of the season. You can unsubscribe at any time.
                    </div>
                </div>
            </div>
        );
    }
}

export default EmailSubscriptionManagementPage;