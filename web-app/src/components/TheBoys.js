import React from 'react';
import './../css/TheBoys.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import ProfilePage from './ProfilePage';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import StarRateIcon from '@material-ui/icons/StarRate';

class TheBoys extends React.Component {
   constructor(props){
      super(props);
      this.state = {
        isLoadingWebsite: true,
        tableData: [],
        selectedTab: 0,
        modalOpened: false
      }

      this.openProfile = this.openProfile.bind(this);
      this.toggleModal = this.toggleModal.bind(this);
   }

   componentDidMount(){
        this.props.fplService.getAllParticipants().then(function(event){
            let particants = event.data;
            let tableData = [];
            for (let participantId in particants) {
                let participant = particants[participantId];
                let numParticipations = participant.badges.filter(badge => badge.badgeType.S === "Participant").length;
                let numChampion = participant.badges.filter(badge => badge.badgeType.S === "League Champion").length;
                let numLastPlace = participant.badges.filter(badge => badge.badgeType.S === "Season Loser").length;
                let numBadges = participant.badges.length;
                let i = 0;
                let stars = [];
                while (i < numChampion) {
                    stars.push(<StarRateIcon></StarRateIcon>)
                    i++;
                }
                tableData.push(
                    <tr className="body-row" key={participantId} onClick={() => this.openProfile(participant)}>
                        <td className="participant-table-name-container">
                            {participant.participant.player_first_name} {participant.participant.player_last_name} {stars}
                        </td>
                        <td>{numParticipations}</td>
                        <td>{numBadges}</td>
                        <td>{numLastPlace}</td>
                        <td>{numChampion}</td>
                    </tr>
                )
            }
            this.setState({
                isLoadingWebsite: false,
                tableData: tableData
            });
        }.bind(this))
   }

   openProfile(event, context) {
       this.setState({
            participant: event,
            modalOpened: true
       });
   }

   toggleModal() {
        this.setState({
            modalOpened: !this.state.modalOpened
        });
   }

   render() {
      return (
         <div className='the-boys-container'>
            <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
               <CircularProgress></CircularProgress>
            </div>
                <div hidden={this.state.isLoadingWebsite}>
                    <div hidden={this.state.selectedTab !== 0}>
                        <table>
                            <thead>
                                <tr className="header-row">
                                    <th className="player-header-container">Player</th>
                                    <th>Entries</th>
                                    <th>Badges</th>
                                    <th>Last Place Finishes</th>
                                    <th>Titles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.tableData}
                            </tbody>
                        </table>
                    </div>
                    <Modal
                        aria-labelledby="transition-modal-title"
                        aria-describedby="transition-modal-description"
                        open={this.state.modalOpened}
                        onClose={this.toggleModal}
                        closeAfterTransition
                        BackdropComponent={Backdrop}
                        BackdropProps={{
                            timeout: 500,
                        }}
                    >
                        <Fade in={this.state.modalOpened}>
                            <div className="player-profile-modal" hidden={!this.state.modalOpened}>
                                <ProfilePage
                                    participant={this.state.participant}
                                ></ProfilePage>
                            </div>
                        </Fade>
                    </Modal>
                </div>
         </div>
      );
   }
}

export default TheBoys;