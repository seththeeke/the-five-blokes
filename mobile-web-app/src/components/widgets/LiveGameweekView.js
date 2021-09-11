import React from 'react';
import './../../css/LiveGameweekView.css';
import GameweekResults from "./GameweekResults";
import CircularProgress from '@material-ui/core/CircularProgress';

class LiveGameweekView extends React.Component {
   constructor(props){
      super(props);
      this.state = {
        isLoadingWidget: true,
        tableData: [],
        widgetHeader: "",
        isLive: false
      }

      this.updateData = this.updateData.bind(this);
      this.toggleRow = this.toggleRow.bind(this);
   }

    componentDidMount(){
        this.updateData();
    }

    updateData(){
        this.props.fplService.getAllLeagueDetails().then(function(leagueDetails){
            let latestLeague = leagueDetails.data.Items[leagueDetails.data.Items.length - 1];
            let leagueId = latestLeague.leagueId.S;
            this.props.fplService.getLatestGameweekForLeagueId(leagueId).then(function(latestGameweekResponse){
                let prevStandings = JSON.parse(latestGameweekResponse.data.standings.S);
                this.props.fplService.getLiveGameweekView(leagueId).then(function(liveViewResponse){
                    let tableData = [];
                    let isLive = !liveViewResponse.data.gameweekMetadata.current_event_finished;
                    let widgetHeader = "Gameweek " + liveViewResponse.data.gameweekMetadata.current_event + " is Live";
                    let liveTeamData = liveViewResponse.data.teams;
                    let sortedLiveTeamData = liveTeamData.sort(function(a, b){
                        return b.gameweek_info.team_points - a.gameweek_info.team_points
                    });
                    let standings = liveViewResponse.data.standings;
                    for (let i in sortedLiveTeamData){
                        let teamData = sortedLiveTeamData[i];
                        let rank = this.getRank(teamData.team_info.id, standings);
                        let prevTotal = this.getPreviousTotal(teamData.team_info.id, prevStandings);
                        let starterYetToPlay = [];
                        let benchYetToPlay = [];
                        for (let j in teamData.gameweek_info.starters_yet_to_play){
                            let playerName = teamData.gameweek_info.starters_yet_to_play[j].second_name;
                            starterYetToPlay.push(
                                <div key={"starter" + playerName}>{playerName}</div>
                            );
                        }
                        for (let k in teamData.gameweek_info.bench_yet_to_play){
                            let playerName = teamData.gameweek_info.bench_yet_to_play[k].second_name;
                            benchYetToPlay.push(
                                <div key={"bench" + playerName}>{playerName}</div>
                            );
                        }
                        let key = "live result" + i;
                        let collapsableId = "liveRow" + teamData.team_info.player_first_name;
                        tableData.push(
                            <tr key={key} className="body-row" onClick={() => this.toggleRow(collapsableId)}>
                                <td>{rank}</td>
                                <td>{teamData.team_info.player_first_name}</td>
                                <td>{teamData.gameweek_info.team_points}</td>
                                <td>{teamData.gameweek_info.bench_points}</td>
                                <td>{teamData.gameweek_info.team_points + prevTotal}</td>
                                <td>{teamData.gameweek_info.starters_yet_to_play.length}</td>
                                <td>{teamData.gameweek_info.bench_yet_to_play.length}</td>
                            </tr>
                        );
                        let otherKey = "not yet played" + i;
                        tableData.push(
                            <tr key={otherKey} id={collapsableId} className="body-row" hidden>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>{starterYetToPlay}</td>
                                <td>{benchYetToPlay}</td>
                            </tr>
                        );
                    }
                    this.setState({
                        isLoadingWidget: false,
                        tableData: tableData,
                        widgetHeader: widgetHeader,
                        isLive: isLive,
                        leagueId: leagueId
                    });
                }.bind(this));
            }.bind(this));
        }.bind(this))
    }

    getRank(id, standings){
        for (let i in standings){
            if (standings[i].league_entry === id) {
                return standings[i].rank;
            }
        }
    }

    getPreviousTotal(id, standings){
        for (let i in standings){
            if (standings[i].league_entry === id) {
                return standings[i].total;
            }
        }
    }

    toggleRow(event, context){
        let row = document.getElementById(event);
        row.hidden = !row.hidden;
    }

    render() {
        if (this.state.leagueId) {
            if (this.state.isLive){
                console.log("Displaying live results");
                return (
                    <div className='live-view-container'>
                        <div className="page-spinner-container" hidden={!this.state.isLoadingWidget}>
                        <CircularProgress></CircularProgress>
                        </div>
                        <div className="live-view-wrapper" hidden={this.state.isLoadingWidget}>
                            <div className="live-view-header"><div className="live-logo"></div> {this.state.widgetHeader}</div>
                            <table>
                                <thead>
                                    <tr className="header-row">
                                        <th>Rank</th>
                                        <th className="player-header-container">Player</th>
                                        <th>Live GW Points</th>
                                        <th>Live Bench Points</th>
                                        <th>Live Total</th>
                                        <th>Starters Yet To Play</th>
                                        <th>Reserves Yet To Play</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.tableData}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            } else {
                return (
                    <GameweekResults
                        fplService={this.props.fplService}
                        leagueId={this.state.leagueId}
                    >
                    </GameweekResults>
                )
            }
        }
        return (<div></div>);
   }
}

export default LiveGameweekView;