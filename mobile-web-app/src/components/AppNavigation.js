import React from 'react';
import {
  Link
} from "react-router-dom";
import './../css/AppNavigation.css';
import HomeIcon from '@material-ui/icons/Home';
import MicIcon from '@material-ui/icons/Mic';
import SportsSoccerIcon from '@material-ui/icons/SportsSoccer';
import EmailIcon from '@material-ui/icons/Email';

class AppNavigation extends React.Component {
    constructor(props) {
        super(props);
        let currentPage = window.location.pathname.substring(1);
        this.state = {
            "selected": currentPage || "home"
        }
        this.onLinkClick = this.onLinkClick.bind(this);
    }

    render() {
        // This block of logic is for ensuring the right button is highlighted when loading the page
        // Its a lot of code, there's probably a better way of doing this, all I need to do is add a className
        // To the div corresponding to this.state.selected
        let home = (
            <div id="home" className="nav-button">
                <HomeIcon fontSize="large" color="primary"></HomeIcon>
                <div className="nav-item-text">Home</div>
            </div>
        )
        if (this.state.selected === "home") {
            home = (
                <div id="home" className="nav-button selected">
                    <HomeIcon fontSize="large" color="primary"></HomeIcon>
                    <div className="nav-item-text">Home</div>
                </div>
            ) 
        }
        let podcast = (
            <div id="podcast" className="nav-button">
                <MicIcon fontSize="large" color="primary"></MicIcon>
                <div className="nav-item-text">Listen</div>
            </div>
        )
        if (this.state.selected === "podcast") {
            podcast = (
                <div id="podcast" className="nav-button selected">
                    <MicIcon fontSize="large" color="primary"></MicIcon>
                    <div className="nav-item-text">Listen</div>
                </div>
            ) 
        }
        let fantasy = (
            <div id="fantasy" className="nav-button">
                <SportsSoccerIcon fontSize="large" color="primary"></SportsSoccerIcon>
                <div className="nav-item-text">Fantasy</div>
            </div>
        )
        if (this.state.selected === "fantasy") {
            fantasy = (
                <div id="fantasy" className="nav-button selected">
                    <SportsSoccerIcon fontSize="large" color="primary"></SportsSoccerIcon>
                    <div className="nav-item-text">Fantasy PL</div>
                </div>
            ) 
        }
        let email = (
            <div id="email-subscription-management" className="nav-button">
                <EmailIcon fontSize="large" color="primary"></EmailIcon>
                <div className="nav-item-text">Follow</div>
            </div>
        )
        if (this.state.selected === "email-subscription-management") {
            email = (
                <div id="email-subscription-management" className="nav-button selected">
                    <EmailIcon fontSize="large" color="primary"></EmailIcon>
                    <div className="nav-item-text">Follow</div>
                </div>
            ) 
        }
        return (
            <div className="nav-wrapper">
                <Link to="/home" onClick={this.onLinkClick.bind(this, "home")}>
                    {home}
                </Link>
                <Link  to="/podcast" onClick={this.onLinkClick.bind(this, "podcast")}>
                    {podcast}
                </Link>
                <Link to="/fantasy" onClick={this.onLinkClick.bind(this, "fantasy")}>
                    {fantasy}
                </Link>
                <Link to="/email-subscription-management" onClick={this.onLinkClick.bind(this, "email-subscription-management")}>
                    {email}
                </Link>
            </div>
        );
    }

    onLinkClick(navChoice, other){
        let previousSelection = document.getElementById(this.state.selected);
        previousSelection.classList.remove('selected');
        let newSelection = document.getElementById(navChoice);
        newSelection.classList.add('selected');
        this.setState({"selected": navChoice});
    }
}

export default AppNavigation;

