import React from 'react';
import './../css/GameweekBadges.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import Badge from './Badge';
import IconService from '../services/IconService';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';

class GameweekBadges extends React.Component {
   constructor(props){
      super(props);
      this.state = {
        isLoadingWebsite: true,
        listObjects: []
      }
      this.iconService = new IconService();
   }

   componentDidMount(){
        let listSubHeaderStyle = {
            backgroundColor: "white",
            fontWeight: "bold",
            fontSize: "18px"
        }
        this.props.fplService.getAllParticipants().then(function(participantsEvent){
            let participantData = participantsEvent.data;
            let badgeToGameweekMap = {};
            let gameweeks = [];
            // sort all the badges into their gameweek
            for (let participantId in participantData) {
                let participant = participantData[participantId];
                let badges = participant.badges;
                for (let i in badges) {
                    let badge = badges[i];
                    let badgeMetadata = JSON.parse(badge.badgeMetadata.S);
                    if (badgeMetadata.gameweek){
                        let gameweekKey = badgeMetadata.gameweek.toString();
                        if (!badgeToGameweekMap[gameweekKey]){
                            badgeToGameweekMap[gameweekKey] = [];
                            gameweeks.push(gameweekKey);
                        }
                        let badgeArrayForGameweek = badgeToGameweekMap[gameweekKey];
                        badgeArrayForGameweek.push(badge);
                        badgeToGameweekMap[gameweekKey] = badgeArrayForGameweek;
                    }
                }
            }
            let listObjects = [];
            gameweeks.sort(function(a, b){return parseInt(b) - parseInt(a)});
            // iterate through the badges for each gameweek and generate a list item for the badge for the gameweek subheader
            for (let j in gameweeks) {
                let gameweek = gameweeks[j];
                let badgesForGameweek = badgeToGameweekMap[gameweek];
                let listItems = [];
                for (let i in badgesForGameweek) {
                    let badge = badgesForGameweek[i];
                    let badgeIcon = this.iconService.getIconByBadgeType(badge.badgeType.S);
                    if (badgeIcon){
                        listItems.push(
                            <ListItem key={`item-${gameweek}-${badge.badgeType.S}-${badge.participantName.S}`}>
                                <div className="gameweek-badge-container">
                                    <Badge badge={badgeIcon} showBadgeType></Badge>
                                    <div className="awarded-to-container">Awarded To: {badge.participantName.S}</div>
                                </div>
                            </ListItem>
                        );
                    } else {
                        console.log(badge);
                    }
                }
                listObjects.push(
                    <li key={`section-${gameweek}`}>
                        <ul>
                            <ListSubheader style={listSubHeaderStyle}>{`Gameweek ${gameweek}`}</ListSubheader>
                            {listItems}
                        </ul>
                    </li>
                );
            }
            this.setState({
                isLoadingWebsite: false,
                listObjects: listObjects
            });
        }.bind(this));
   }

   render() {
        return (
            <div className='gameweek-badges-container'>
                <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
                    <CircularProgress></CircularProgress>
                </div>
                <div className="gameweek-badges-wrapper" hidden={this.state.isLoadingWebsite}>
                    <div className="gameweek-badges-title-container">Badges</div>
                    <div className="gameweek-badge-list" hidden={this.state.isLoadingWebsite}>
                        <List subheader={<li />}>
                            {this.state.listObjects}
                        </List>
                    </div>
                </div>
            </div>
        );
   }
}

export default GameweekBadges;