import React from 'react';
import './../../css/Podcast.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import hoodie from './../../img/merch/hoodie.jpeg';
import hat from './../../img/merch/hat.jpg';
import sticker from './../../img/merch/sticker.jpg';
import arsenalBloke from "../../img/blokes/Blokes-avatar-Seth-transparent.png";
import chelseaBloke from "../../img/blokes/Blokes-avatar-Nathan-transparent.png";
import liverpoolBloke from "../../img/blokes/Blokes-avatar-Nima-transparent.png";
import manUnitedBloke from "../../img/blokes/Blokes-avatar-Evan-transparent.png";
import barcelonaBloke from "../../img/blokes/Blokes-avatar-Amine-transparent.png";

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
      let path = window.location.pathname;
      let href = window.location.href;
      let base = href.substring(0, href.indexOf(path));
      let blokeBlogsHref = base + "/bloke-blogs"
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
                     <div className="blokes-blog-title">View the Five Blokes Blogs</div>
                     <div className="bloke-blog-link-container">
                        <a className="blog-main-link" href={blokeBlogsHref}>
                           <img className="blog-link-bloke" alt="the-bloke" src={arsenalBloke}></img>
                           <div>The Arsenal Bloke</div>
                        </a>
                     </div>
                     <div className="bloke-blog-link-container">
                        <a className="blog-main-link" href={blokeBlogsHref}>
                           <img className="blog-link-bloke" alt="the-bloke" src={chelseaBloke}></img>
                           <div>The Chelsea Bloke</div>
                        </a>
                     </div>
                     <div className="bloke-blog-link-container">
                        <a className="blog-main-link" href={blokeBlogsHref}>
                           <img className="blog-link-bloke" alt="the-bloke" src={liverpoolBloke}></img>
                           <div>The Liverpool Bloke</div>
                        </a>
                     </div>
                     <div className="bloke-blog-link-container">
                        <a className="blog-main-link" href={blokeBlogsHref}>
                           <img className="blog-link-bloke" alt="the-bloke" src={manUnitedBloke}></img>
                           <div>The Man United Bloke</div>
                        </a>
                     </div>
                     <div className="bloke-blog-link-container">
                        <a className="blog-main-link" href={blokeBlogsHref}>
                           <img className="blog-link-bloke" alt="the-bloke" src={barcelonaBloke}></img>
                           <div>The Barcelona Bloke</div>
                        </a>
                     </div>
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
               </div>
            </div>
         </div>
      );
   }
}

export default Podcast;