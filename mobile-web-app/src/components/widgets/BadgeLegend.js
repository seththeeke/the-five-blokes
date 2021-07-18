import React from 'react';
import './../../css/BadgeLegend.css';
import IconService from '../../services/IconService.js';
import Badge from './Badge';

class BadgeLegend extends React.Component {
    constructor(props){
        super(props);
        this.iconService = new IconService();

        this.buildBadgeRows = this.buildBadgeRows.bind(this);
    }

    render() {
        let seasonBadges = this.iconService.getSeasonIcons();
        let gameweekBadges = this.iconService.getGameweekIcons();
        let seasonLegend = this.buildBadgeRows(seasonBadges);
        let gameweekLegend = this.buildBadgeRows(gameweekBadges);
        return (
            <div className="badges-legend-container">
                <div className="badge-legend-title">Badge Definitions</div>
                <div className="gameweek-badges-container">
                    <div className="legend-title-container">
                        <div className="legend-title">Gameweek</div>
                        <div className="legend-title-subtext">Awarded at the end of every gameweek</div>
                    </div>
                    <div className="badges-container">
                        {gameweekLegend}
                    </div>
                </div>
                <div className="season-badges-container">
                    <div className="legend-title-container">
                        <div className="legend-title">Season</div>
                        <div className="legend-title-subtext">Awarded at the end of every season</div>
                    </div>
                    <div className="badges-container">
                        {seasonLegend}
                    </div>
                </div>
            </div>
        );
   }

   buildBadgeRows(badges){
        let badgeContent = [];
        let counter = 0;
        let badgeRows = [];
        let rowLength = 5;
        for (let i in badges){
            counter++;
            let badge = badges[i];
            badgeRows.push(
                <div className="badge-container" key={i}>
                    <Badge badge={badge}></Badge>
                </div>
            );
            if (badgeRows.length === rowLength){
                badgeContent.push(
                    <div className="badge-row" key={counter}>
                        {badgeRows}
                    </div>
                );
                badgeRows = []
            }
        }
        if (badgeRows.length > 0){
            badgeContent.push(
                <div className="badge-row" key={counter}>
                    {badgeRows}
                </div>
            );
        }
        return badgeContent;
   }

}
export default BadgeLegend;