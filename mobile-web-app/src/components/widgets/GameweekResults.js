import React from 'react';
import './../../css/GameweekResults.css';
import CircularProgress from '@material-ui/core/CircularProgress';

class GameweekResults extends React.Component {
   constructor(props){
      super(props);
      this.state = {
        isLoadingWidget: true,
        tableData: [],
      }

      this.updateData = this.updateData.bind(this);
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
        if (this.props.leagueId) {
            this.props.fplService.getLatestGameweek(this.props.leagueId).then(function(gameweekEvent){
                if (gameweekEvent.data) {
                    let standings = JSON.parse(gameweekEvent.data.standings.S);
                    this.props.fplService.getAllParticipants(this.props.leagueId).then(function(participantsEvent){
                        let participantData = participantsEvent.data;
                        let tableData = [];
                        for (let i in standings) {
                            let standing = standings[i];
                            let participant = participantData[standing.league_entry].participant;
                            tableData.push(
                                <tr className="body-row" key={i}>
                                    <td>{standing.rank}</td>
                                    <td className="gameweek-results-player-container">{participant.player_first_name}</td>
                                    <td>{standing.event_total}</td>
                                    <td>{standing.last_rank}</td>
                                    <td>{standing.total}</td>
                                </tr>
                            )
                        }
                        this.setState({
                            isLoadingWidget: false,
                            tableData: tableData
                        });
                    }.bind(this))
                } else {
                    // No gameweek data, display an empty table with participant's names
                    this.props.fplService.getAllParticipants(this.props.leagueId).then(function(participantsEvent){
                        let participantData = participantsEvent.data;
                        let tableData = [];
                        for (let key in participantData) {
                            if (participantData.hasOwnProperty(key)) {
                                let participant = participantData[key].participant;
                                tableData.push(
                                    <tr className="body-row" key={key}>
                                        <td>-</td>
                                        <td className="gameweek-results-player-container">{participant.player_first_name}</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                    </tr>
                                )
                            }
                        }
                        this.setState({
                            isLoadingWidget: false,
                            tableData: tableData
                        });
                    }.bind(this))
                }
            }.bind(this))
        } else {
            // Will display empty table
            this.setState({
                isLoadingWidget: false
            });
        }
    }

   render() {
      return (
         <div className='results-container'>
            <div className="page-spinner-container" hidden={!this.state.isLoadingWidget}>
               <CircularProgress></CircularProgress>
            </div>
            <div className="gameweek-results-wrapper" hidden={this.state.isLoadingWidget}>
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