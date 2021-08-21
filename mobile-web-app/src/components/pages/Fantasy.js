import React from 'react';
import './../../css/Fantasy.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import GameweekResults from './../widgets/GameweekResults';
import TheBoys from './../widgets/TheBoys';
import Standings from "./../widgets/Standings";
import GameweekBadges from './../widgets/GameweekBadges';
import LeagueChampions from './../widgets/LeagueChampions';
import DraftRoom from './../widgets/DraftRoom';

class Fantasy extends React.Component {
   constructor(props){
      super(props);
      this.state = {
         isLoadingWebsite: true,
         selectedTab: 1,
         legendOpen: false,
         options: [],
         leagueId: undefined
      }

      this.toggleLegend = this.toggleLegend.bind(this);
      this.updateLeagueSelection = this.updateLeagueSelection.bind(this);
   }

   componentDidMount(){
      this.props.fplService.getAllLeagueDetails().then(function(response){
         let leagueDetails = response.data.Items;
         let sortedDetails = leagueDetails.sort(function(a,b){
            return parseInt(b.year.S) - parseInt(a.year.S);
         });
         let options = [];
         console.log(leagueDetails);
         // Need to change this to be the latest by default
         let selection = sortedDetails[0]
         for (let i in sortedDetails) {
            let league = sortedDetails[i];
            options.push(
               <option key={league.year.S} id={league.year.S} value={league.leagueId.S}>{league.year.S}</option>
            )
         }
         this.setState({
            isLoadingWebsite: false,
            options: options,
            leagueId: selection.leagueId.S
         });
      }.bind(this));
   }

   toggleLegend(){
      this.setState({
         legendOpen: !this.state.legendOpen
      });
   }

   updateLeagueSelection(){
      let selection = document.getElementById("leagues").value;
      this.setState({
         leagueId: selection
      });
   }

   render() {
      return (
         <div className='home-container'>
            <div className="year-select-container">
               <select id="leagues" name="leagues" onChange={this.updateLeagueSelection}>
                  {this.state.options}
               </select>
            </div>
            <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
               <CircularProgress></CircularProgress>
            </div>
            <div hidden={this.state.isLoadingWebsite}>
               <div className="grid-container">
                     <div className="grid-item">
                        <LeagueChampions
                           fplService={this.props.fplService}
                           leagueId={this.state.leagueId}
                        >
                        </LeagueChampions>
                    </div>
                    <div className="grid-item">
                        <TheBoys
                            fplService={this.props.fplService}
                        >
                        </TheBoys>
                    </div>
                    <div className="grid-item">
                        <GameweekBadges
                           fplService={this.props.fplService}
                           leagueId={this.state.leagueId}
                        >
                        </GameweekBadges>
                    </div>
                    <div className="grid-item">
                        <GameweekResults
                           fplService={this.props.fplService}
                           leagueId={this.state.leagueId}
                        >
                        </GameweekResults>
                    </div>
                    <div className="grid-item">
                        <Standings
                           fplService={this.props.fplService}
                           leagueId={this.state.leagueId}
                        >
                        </Standings>
                    </div>
                    <div className="grid-item">
                        <DraftRoom
                           fplService={this.props.fplService}
                           leagueId={this.state.leagueId}
                        >
                        </DraftRoom>
                    </div>
               </div>
            </div>
         </div>
      );
   }
}

export default Fantasy;