import React from 'react';
import './../../css/Podcast.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import hoodie from './../../img/merch/hoodie.jpeg';
import hat from './../../img/merch/hat.jpg';
import sticker from './../../img/merch/sticker.jpg';

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
                  {/* <img className="the-five-blokes-heads" src={theFiveBlokes} alt="five-blokes-logo"></img> */}
                  <div className="grid-item">
                     <iframe title="spotify" src="https://open.spotify.com/embed-podcast/show/7Hw0EJXJE2Zmi4pZ13aehl" width="100%" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                  </div>
                  <div>
                     <div className="shop-blokes-title">Shop Merch!</div>
                     <a href="https://www.etsy.com/shop/TheFiveBlokes?ref=search_shop_redirect">
                        <img className="merch" src={hoodie} alt="hoodie"></img>
                     </a>
                     <a href="https://www.etsy.com/shop/TheFiveBlokes?ref=search_shop_redirect">
                        <img className="merch" src={sticker} alt="hoodie"></img>
                     </a>
                     <a href="https://www.etsy.com/shop/TheFiveBlokes?ref=search_shop_redirect">
                        <img className="merch" src={hat} alt="hoodie"></img>
                     </a>
                  </div>
                  {/* <div className="grid-item">
                     <div className="twitter-embed-wrapper">
                        <TwitterTimelineEmbed
                           sourceType="profile"
                           screenName="blokesfive"
                        />
                     </div>
                  </div> */}
               </div>
            </div>
         </div>
      );
   }
}

export default Podcast;