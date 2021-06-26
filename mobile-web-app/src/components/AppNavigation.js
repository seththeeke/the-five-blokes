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
        return (
            <div className="nav-wrapper">
                <Link to="/home" onClick={this.onLinkClick.bind(this, "home")}>
                    <div id="home" className="nav-button">
                        <HomeIcon fontSize="large" color="primary"></HomeIcon>
                    </div>
                </Link>
                <Link  to="/podcast" onClick={this.onLinkClick.bind(this, "podcast")}>
                    <div id="podcast" className="nav-button">
                        <MicIcon fontSize="large" color="primary"></MicIcon>
                    </div>
                </Link>
                <Link to="/fantasy" onClick={this.onLinkClick.bind(this, "fantasy")}>
                    <div id="fantasy" className="nav-button">
                        <SportsSoccerIcon fontSize="large" color="primary"></SportsSoccerIcon>
                    </div>
                </Link>
                <Link to="/email-subscription-management" onClick={this.onLinkClick.bind(this, "email-subscription-management")}>
                    <div id="email-subscription-management" className="nav-button">
                        <EmailIcon fontSize="large" color="primary"></EmailIcon>
                    </div>
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

