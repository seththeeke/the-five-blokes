import React from 'react';
import './../css/Podcast.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import { TwitterTimelineEmbed } from 'react-twitter-embed';

class Podcast extends React.Component {
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
                     <iframe title="spotify" src="https://open.spotify.com/embed-podcast/show/7Hw0EJXJE2Zmi4pZ13aehl" width="100%" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                  </div>
                  <div className="grid-item">
                     <div className="twitter-embed-wrapper">
                        <TwitterTimelineEmbed
                           sourceType="profile"
                           screenName="blokesfive"
                        />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}

export default Podcast;