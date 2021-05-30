import React from 'react';
import {
  Link
} from "react-router-dom";
import './../css/AppHeader.css';

class AppHeader extends React.Component {
    render() {
        return (
            <div className="header-wrapper">
                <Link to="/home">
                    <div className="header">The Five Blokes</div>
                </Link>
            </div>
        );
    }
}

export default AppHeader;