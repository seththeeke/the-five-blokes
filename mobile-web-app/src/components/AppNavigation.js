import React from 'react';
import {
  Link
} from "react-router-dom";
import './../css/AppNavigation.css';
import HomeIcon from '@material-ui/icons/Home';
import MicIcon from '@material-ui/icons/Mic';
import SportsSoccerIcon from '@material-ui/icons/SportsSoccer';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import EmailIcon from '@material-ui/icons/Email';

class AppNavigation extends React.Component {
    render() {
        return (
            <div className="nav-wrapper">
                <div className="nav-button">
                    <Link to="/home">
                        <HomeIcon></HomeIcon>
                    </Link>
                </div>
                <div className="nav-button">
                    <Link to="/podcast">
                        <MicIcon></MicIcon>
                    </Link>
                </div>
                <div className="nav-button">
                    <Link to="/fantasy">
                        <SportsSoccerIcon></SportsSoccerIcon>
                    </Link>
                </div>
                <div className="nav-button">
                    <Link to="/email-subscription-management">
                        <EmailIcon></EmailIcon>
                    </Link>
                </div>
            </div>
        );
    }
}

export default AppNavigation;

