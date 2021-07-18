import React from 'react';
import './../../css/LeagueChampions.css';
import Trophy from './Trophy';
import CircularProgress from '@material-ui/core/CircularProgress';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import TrophyRoom from './TrophyRoom';

class LeagueChampions extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoadingWidget: true,
            champsOpen: false,
            champion: undefined,
            teamName: undefined,
            legendOpen: false,
            allChampData: []
        }
        this.updateData = this.updateData.bind(this);
        this.toggleLegend = this.toggleLegend.bind(this);
    }

    componentDidMount(){
        this.updateData();
    }

    componentDidUpdate(prevProps) {
        if(this.props.leagueId !== prevProps.leagueId){
            this.setState({
                isLoadingWidget: true
            });
            this.updateData();
        }
    } 

    updateData(){
        this.props.fplService.getLeagueChampions().then(function(event){
            let response = event.data;
            let champ = undefined;
            for (let index in response.champions.Items){
                let champion = response.champions.Items[index];
                if (champion.id.S.includes(this.props.leagueId)){
                    champ = champion;
                }
            }
            if (champ){
                for (let index in response.allLeagueDetails.Items){
                    let leagueDetails = response.allLeagueDetails.Items[index];
                    if (leagueDetails.leagueId.S.includes(this.props.leagueId)){
                        let participants = JSON.parse(leagueDetails.participants.S);
                        for (let j in participants){
                            let participant = participants[j];
                            if (champ.participantId.S === participant.id.toString()) {
                                this.setState({
                                    champion: participant.player_first_name,
                                    teamName: participant.entry_name,
                                    isLoadingWidget: false,
                                    allChampData: event.data
                                });
                            }
                        }
                    }
                }
            } else {
                // active league
                this.setState({
                    champion: "TBD",
                    teamName: "",
                    isLoadingWidget: false,
                    allChampData: event.data
                });
            }
        }.bind(this))
    }

    toggleLegend(){
        this.setState({
            legendOpen: !this.state.legendOpen
        });
    }

    render() {
        return (
            <div className='league-champs-container'>
                <div className="page-spinner-container" hidden={!this.state.isLoadingWidget}>
                    <CircularProgress></CircularProgress>
                </div>
                <div className="league-champs-wrapper" hidden={this.state.isLoadingWidget}>
                    <Trophy
                        champion={this.state.champion}
                        teamName={this.state.teamName}
                    >
                    </Trophy>
                    <button onClick={this.toggleLegend}>View All Champions</button>
                </div>
                <Modal
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    open={this.state.legendOpen}
                    onClose={this.toggleLegend}
                    closeAfterTransition
                    BackdropComponent={Backdrop}
                    BackdropProps={{
                        timeout: 500,
                    }}
                >
                    <Fade in={this.state.legendOpen}>
                        <div className="trophy-room-container" style={this.state.legendOpen ? {} : { display: 'none' }}>
                            <TrophyRoom
                                championsData={this.state.allChampData}
                            ></TrophyRoom>
                        </div>
                    </Fade>
                </Modal>
            </div>
        );
    }
}

export default LeagueChampions;