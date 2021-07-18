import React from 'react';
import './../../css/Trophy.css';

class Trophy extends React.Component {
    render() {
        return (
            <div className='league-champs-container'>
                <div className="box-canvas">
                    <div className="handle left"></div>
                    <div className="handle right"></div>
                    <div className="stand">
                        <div className="plaque">
                            1st
                            <div className="screws top"></div>
                            <div className="screws bottom"></div>
                        </div>
                    </div>
                    <div className="trophy-bottom">
                        <div className="cutout left"></div>
                    </div>
                    <div className="cup">
                        <div className="champion-engraving engraved-text">{this.props.champion}</div>
                        <div className="team-engraving engraved-text">{this.props.teamName}</div>
                        <div className="lip"></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Trophy;