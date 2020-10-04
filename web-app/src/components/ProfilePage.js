import React from 'react';
import './../css/ProfilePage.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconService from '../services/IconService.js';
import Badge from './Badge';
import StarRateIcon from '@material-ui/icons/StarRate';

class ProfilePage extends React.Component {
   constructor(props){
      super(props);
      this.state = {
        isLoadingWebsite: false
      }
      this.iconService = new IconService();
   }

   render() {
      if (this.props.participant) {
        let badgeContent = [];
        let badgeCounter = {};
        for (let i in this.props.participant.badges) {
            let badge = this.props.participant.badges[i];
            if (!badgeCounter[badge.badgeType.S]) {
                badgeCounter[badge.badgeType.S] = 0;
            }
            badgeCounter[badge.badgeType.S] = badgeCounter[badge.badgeType.S] + 1;
        }
        let counter = 0;
        let badgeRows = [];
        for (let badgeType in badgeCounter){
            counter++;
            let badge = this.iconService.getIconByBadgeType(badgeType);
            badgeRows.push(
                <div className="badge-container" key={badgeType}>
                    <Badge badge={badge}></Badge>
                    <span className="badge-counter-container"> x {badgeCounter[badgeType]}</span>
                </div>
            );
            if (badgeRows.length === 4){
                badgeContent.push(
                    <div className="badge-row" key={badgeType}>
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
        let sortedParticipations = this.props.participant.badges.filter(badge => badge.badgeType.S === "Participant").sort(function(a, b){return parseInt(JSON.parse(a.badgeMetadata.S).year) - parseInt(JSON.parse(b.badgeMetadata.S).year)});
        let numParticipations = sortedParticipations.length;
        let firstYear = JSON.parse(sortedParticipations[0].badgeMetadata.S).year;
        let numChampion = this.props.participant.badges.filter(badge => badge.badgeType.S === "League Champion").length;
        let numLastPlace = this.props.participant.badges.filter(badge => badge.badgeType.S === "Season Loser").length;
        let numBadges = this.props.participant.badges.length;
        let i = 0;
        let stars = [];
        while (i < numChampion) {
            stars.push(<StarRateIcon></StarRateIcon>)
            i++;
        }
        return (
            <div className='profile-page-container'>
                <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
                    <CircularProgress></CircularProgress>
                </div>
                <div hidden={this.state.isLoadingWebsite}>
                    <div className="profile-wrapper">
                        <div className="main-profile-container">
                                <div className="short-info-container">
                                    <div className="short-name-container">{this.props.participant.participant.short_name}</div>
                                    <div>{stars}</div>
                                </div>
                                <div className="player-info-container">
                                    <div className="player-name-container">{this.props.participant.participant.player_first_name} {this.props.participant.participant.player_last_name}</div>
                                    <div className="subtitle-container">Founded: {firstYear}</div>
                                    <div className="subtitle-container">Entries: {numParticipations}</div>
                                    <div className="subtitle-container">Titles: {numChampion}</div>
                                    <div className="subtitle-container">Last Place Finishes: {numLastPlace}</div>
                                    <div className="subtitle-container">Badges: {numBadges}</div>
                                </div>
                        </div>
                        <div className="badges-container">
                            {badgeContent}
                        </div>
                    </div>
                </div>
            </div>
         );
      }
      return (
         <div className='profile-page-container'>
         </div>
      );
   }
}

export default ProfilePage;