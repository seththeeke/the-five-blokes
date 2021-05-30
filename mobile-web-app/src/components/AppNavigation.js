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
    render() {
        return (
            <div className="nav-wrapper">
                <Link to="/home">
                    <div className="nav-button">
                        <HomeIcon fontSize="large" color="primary"></HomeIcon>
                    </div>
                </Link>
                <Link to="/podcast">
                    <div className="nav-button">
                        <MicIcon fontSize="large" color="primary"></MicIcon>
                    </div>
                </Link>
                <Link to="/fantasy">
                    <div className="nav-button">
                        <SportsSoccerIcon fontSize="large" color="primary"></SportsSoccerIcon>
                    </div>
                </Link>
                <Link to="/email-subscription-management">
                    <div className="nav-button">
                        <EmailIcon fontSize="large" color="primary"></EmailIcon>
                    </div>
                </Link>
            </div>
        );
    }
}

export default AppNavigation;

