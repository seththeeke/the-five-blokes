import React from 'react';
import {
  Link
} from "react-router-dom";
import './../css/AppHeader.css';
import fiveBlokesLogo from './../img/five-blokes-sample.png';

class AppHeader extends React.Component {
    render() {
        return (
            <div className="header-wrapper">
                <Link to="/home">
                    {/* <div className="header">The Five Blokes</div> */}
                    <img className="header-logo" src={fiveBlokesLogo} alt="five-blokes-logo"></img>
                </Link>
            </div>
        );
    }
}

export default AppHeader;