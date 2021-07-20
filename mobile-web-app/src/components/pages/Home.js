import React from 'react';
import './../../css/Home.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import EmailManagementWidget from './../widgets/EmailManagementWidget';
import TheBoys from './../widgets/TheBoys';

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
               <div className="grid-container">
                  {/* <div className="grid-item">
                     <img className="five-blokes" alt="logo" src={fiveBlokes}></img>
                  </div> */}
                  <div className="grid-item">
                     <iframe title="spotify" src="https://open.spotify.com/embed-podcast/show/7Hw0EJXJE2Zmi4pZ13aehl" width="100%" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                  </div>
                  <div className="grid-item">
                     <TheBoys
                        fplService={this.props.fplService}
                     >
                     </TheBoys>
                  </div>
                  <div className="grid-item">
                     <EmailManagementWidget
                        emailSubscriptionService={this.props.emailSubscriptionService}
                     >
                     </EmailManagementWidget>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}

export default Home;