import React from 'react';
import './../../css/TrophyRoom.css';
import Trophy from './Trophy';
import CircularProgress from '@material-ui/core/CircularProgress';

class TrophyRoom extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoadingWidget: true,
            trophyData: []
        }
    }

    componentDidMount(){
        let champs = this.props.championsData;
        let leagueDetails = champs.allLeagueDetails.Items;
        let champions = champs.champions.Items;
        let trophys = [];
        for (let index in champions){
            let champ = champions[index];
            trophys.push(this.buildTrophy(champ, leagueDetails));
        }
        this.setState({
            isLoadingWidget: false,
            trophyData: trophys
        });
    }

    buildTrophy(champ, allLeagueDetails){
        // Hack for Evan's first title
        if (champ.id.S.includes("2019")) {
            return (
                <div
                    key={champ.participantId.S}
                    className="trophy-wrapper"
                >
                    <Trophy
                        champion="Evan"
                        teamName="MUSOMFC"
                    >
                    </Trophy>
                    <div className="champ-year">2019</div>
                </div>
            );
        }
        for (let index in allLeagueDetails){
            let leagueDetails = allLeagueDetails[index];
            let participants = JSON.parse(leagueDetails.participants.S);
            for (let j in participants){
                let participant = participants[j];
                if (champ.participantId.S === participant.id.toString()) {
                    return (
                        <div
                            key={champ.participantId.S}
                            className="trophy-wrapper"
                        >
                            <Trophy
                                champion={participant.player_first_name}
                                teamName={participant.entry_name}
                            >
                            </Trophy>
                            <div className="champ-year">{leagueDetails.year.S}</div>
                        </div>
                    );
                }
            }
        }
        
    }

    render() {
        return (
            <div className='trophy-room-container'>
                <div className="page-spinner-container" hidden={!this.state.isLoadingWidget}>
                    <CircularProgress></CircularProgress>
                </div>
                <div className="trophy-room-wrapper" hidden={this.state.isLoadingWidget}>
                    <div className="badge-legend-title">The Trophy Room</div>
                    {this.state.trophyData}
                </div>
            </div>
        );
    }
}

export default TrophyRoom;