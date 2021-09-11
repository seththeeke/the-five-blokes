import React from 'react';
import './../../css/BlogPage.css';
import CircularProgress from '@material-ui/core/CircularProgress';

class WhyYouShouldWatchSeriaA extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoadingWebsite: true,
            spotifyEpisodeLink: "",
            pageViews: ""
        }
    }

    componentDidMount(){
        this.props.pageViewService.incrementPageView("Why You Should Watch The Serie A", "chelsea-bloke").then(
            function(response){
                let spotifyEmbedLink = "";
                if (response.data.Item.spotifyEmbedLink) {
                    spotifyEmbedLink = response.data.Item.spotifyEmbedLink.S
                }
                this.setState({
                    spotifyEpisodeLink: spotifyEmbedLink,
                    pageViews: response.data.Item.pageViews.N
                });
            }.bind(this),
            function(error){
                console.log(error);
            }
        );
        this.setState({
            isLoadingWebsite: false
        });
    }

    render() {
        return (
            <div className='blog-post-container'>
                <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
                    <CircularProgress></CircularProgress>
                </div>
                <div hidden={this.state.isLoadingWebsite}>
                    <div className="blog-page-header">
                        <div className="bloke-container">
                            <img className="bloke" alt="the-bloke" src={this.props.blokeIcon}></img>
                        </div>
                        <div className="bloke-header">
                            {this.props.blokeHeader}
                        </div>
                    </div>
                    <div className="blog-post-container">
                        <div className="spotify-embed-episode-container" hidden={this.state.spotifyEpisodeLink.length === 0}>
                            <iframe title="spotify-embed-episode" src={this.state.spotifyEpisodeLink} width="100%" frameBorder="0" allowtransparency="true" allow="encrypted-media"></iframe>
                        </div>
                        <div className="blog-header">
                            Why You Should Watch Serie A
                        </div>
                        <div className="blog-date">
                            Date: 9/1/2021
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default WhyYouShouldWatchSeriaA;