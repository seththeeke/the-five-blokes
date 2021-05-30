import React from 'react';
import './../css/Home.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import GameweekResults from './GameweekResults';
import TheBoys from './TheBoys';
import Standings from "./Standings";
import LeagueHistory from './LeagueHistory';
import GameweekBadges from './GameweekBadges';

class Fantasy extends React.Component {
   constructor(props){
      super(props);
      this.state = {
         isLoadingWebsite: true,
         selectedTab: 1,
         legendOpen: false
      }

      this.toggleLegend = this.toggleLegend.bind(this);
   }

   componentDidMount(){
      this.setState({
         isLoadingWebsite: false
      });
   }

   toggleLegend(){
      this.setState({
         legendOpen: !this.state.legendOpen
      });
   }

   render() {
      return (
         <div className='home-container'>
            <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
               <CircularProgress></CircularProgress>
            </div>
            <div hidden={this.state.isLoadingWebsite}>
               <div className="grid-container">
                    <div className="grid-item">
                        <TheBoys
                            fplService={this.props.fplService}
                        >
                        </TheBoys>
                    </div>
                    {/* <div className="grid-item">
                        <LeagueHistory></LeagueHistory>
                    </div> */}
                    <div className="grid-item">
                        <GameweekBadges
                            fplService={this.props.fplService}
                        >
                        </GameweekBadges>
                    </div>
                    <div className="grid-item">
                        <GameweekResults
                            fplService={this.props.fplService}
                        >
                        </GameweekResults>
                    </div>
                    <div className="grid-item">
                        <Standings
                            fplService={this.props.fplService}
                        >
                        </Standings>
                    </div>
               </div>
            </div>
         </div>
      );
   }
}

export default Fantasy;