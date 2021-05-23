import React from 'react';
import './../css/Standings.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chart from 'react-apexcharts'

class Standings extends React.Component {
   constructor(props){
      super(props);
      this.state = {
        isLoadingWebsite: true,
        options: {
            chart: {
              id: 'standings',
              toolbar: {
                show: false
              },
            },
            xaxis: {
              categories: ["GW 2", "GW 3", "GW 4", "GW 5", "GW 6", "GW 7", "GW 8", "GW 9", "GW 10", "GW 11", "GW 12", "GW 13", "GW 14", "GW 15", "GW 16", "GW 17", "GW 18", "GW 19", "GW 18", "GW 19", "GW 20", "GW 21", "GW 22", "GW 23", "GW 24", "GW 25", "GW 26", "GW 27", "GW 28", "GW 29", "GW 30", "GW 31", "GW 32", "GW 33", "GW 34", "GW 35", "GW 36", "GW 37", "GW 38"],
              title: {
                text: 'Gameweek'
              }
            },
            yaxis: {
                title: {
                  text: 'Rank'
                },
                reversed: true
            },
            colors: ['#FF5733', '#FFB533', '#FFE933', '#D7FF33', '#33FFA5', '#33FFF0', '#33A5FF', '#3349FF', '#B533FF', '#FF33F9', '#FF3386']
        },
        series: []
      }
   }

   componentDidMount(){
        this.props.fplService.getStandingsHistoryForActiveLeague().then(function(historyEvent){
            let standingsHistory = historyEvent.data;
            standingsHistory.sort(function(a, b){return parseInt(b.gameweek) - parseInt(a.gameweek)});
            console.log(standingsHistory.length);
            this.props.fplService.getAllParticipants().then(function(participantsEvent){
                let participantData = participantsEvent.data;
                let seriesData = [];
                let rankMap = {};
                for (let i in standingsHistory) {
                    let standingsForGameweek = JSON.parse(standingsHistory[i].standings);
                    for (let j in standingsForGameweek) {
                        let standing = standingsForGameweek[j];
                        let participant = participantData[standing.league_entry].participant;
                        let participantName = participant.player_first_name  + " " + participant.player_last_name;
                        if (!rankMap[participantName]) {
                            rankMap[participantName] = []
                        }
                        let data = rankMap[participantName];
                        data.unshift(standing.rank);
                    }
                }
                for (let participantName in rankMap) {
                    seriesData.push(
                        {
                            name: participantName,
                            data: rankMap[participantName]
                        }
                    )
                }
                this.setState({
                    isLoadingWebsite: false,
                    series: seriesData
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
                <div hidden={this.state.isLoadingWebsite}>
                <div className="standings-title-container">Season Standings</div>
                <Chart className="standings-chart" options={this.state.options} series={this.state.series} type="line" />
            </div>
         </div>
      );
   }
}

export default Standings;