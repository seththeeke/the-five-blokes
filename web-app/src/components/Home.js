import React from 'react';
import './../css/Home.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import InfoIcon from '@material-ui/icons/Info';
import TheBoys from './TheBoys';
import circularLogo from "../img/circular-prem-lion.png";
import GameweekResults from './GameweekResults';
import Standings from "./Standings";
import BadgeLegend from "./BadgeLegend";
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import LeagueHistory from './LeagueHistory';
import GameweekBadges from './GameweekBadges';

class Home extends React.Component {
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
               <div className="app-bar-wrapper">
                  <div className="app-bar-content-wrapper">
                     <div className="logo-wrapper">
                        <img className="logo" alt="logo" src={circularLogo}></img>
                     </div>
                     <div className="header-wrapper">
                        Last of the Mohigans
                     </div>
                     <div className="info-icon-container" onClick={this.toggleLegend}>
                        <InfoIcon/>
                     </div>
                  </div>
               </div>
               <div className="grid-container">
                  <div className="five-blokes-banner">
                     <iframe src="https://open.spotify.com/embed-podcast/show/7Hw0EJXJE2Zmi4pZ13aehl" width="100%" height="232" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                  </div>
                  <div className="grid-item">
                     <TheBoys
                        fplService={this.props.fplService}
                     >
                     </TheBoys>
                  </div>
                  <div className="grid-item">
                     <LeagueHistory></LeagueHistory>
                  </div>
                  <div className="grid-item">
                     <GameweekBadges
                        fplService={this.props.fplService}
                     >
                     </GameweekBadges>
                  </div>
                  <div className="grid-item">
                     <Standings
                        fplService={this.props.fplService}
                     >
                     </Standings>
                  </div>
                  <div className="grid-item">
                     <GameweekResults
                        fplService={this.props.fplService}
                     >
                     </GameweekResults>
                  </div>
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
                     <div className="badge-legend-container" style={this.state.legendOpen ? {} : { display: 'none' }}>
                        <BadgeLegend></BadgeLegend>
                     </div>
                  </Fade>
               </Modal>
            </div>
         </div>
      );
   }
}

export default Home;