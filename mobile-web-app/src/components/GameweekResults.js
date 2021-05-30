import React from 'react';
import './../css/GameweekResults.css';
import CircularProgress from '@material-ui/core/CircularProgress';

class GameweekResults extends React.Component {
   constructor(props){
      super(props);
      this.state = {
        isLoadingWebsite: true,
        tableData: [],
      }
   }

   componentDidMount(){
        this.props.fplService.getLatestGameweek().then(function(gameweekEvent){
            let standings = JSON.parse(gameweekEvent.data.standings.S);
            this.props.fplService.getAllParticipants().then(function(participantsEvent){
                let participantData = participantsEvent.data;
                let tableData = [];
                for (let i in standings) {
                    let standing = standings[i];
                    let participant = participantData[standing.league_entry].participant;
                    tableData.push(
                        <tr className="body-row" key={i}>
                            <td>{standing.rank}</td>
                            <td className="gameweek-results-player-container">{participant.player_first_name} {participant.player_last_name}</td>
                            <td>{standing.event_total}</td>
                            <td>{standing.last_rank}</td>
                            <td>{standing.total}</td>
                        </tr>
                    )
                }
                this.setState({
                    isLoadingWebsite: false,
                    tableData: tableData
                });
            }.bind(this))
        }.bind(this))
   }

   render() {
      return (
         <div className='results-container'>
            <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
               <CircularProgress></CircularProgress>
            </div>
            <div className="gameweek-results-wrapper" hidden={this.state.isLoadingWebsite}>
                <table>
                    <thead>
                        <tr className="header-row">
                            <th>Rank</th>
                            <th className="player-header-container">Player</th>
                            <th>Gameweek Points</th>
                            <th>Previous Rank</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.tableData}
                    </tbody>
                </table>
            </div>
         </div>
      );
   }
}

export default GameweekResults;