import React from 'react';
import './../../css/BlogPage.css';
import CircularProgress from '@material-ui/core/CircularProgress';

class HowGoodWereTheInvincibles extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoadingWebsite: true,
            spotifyEpisodeLink: "",
            pageViews: ""
        }
    }

    componentDidMount(){
        this.props.pageViewService.incrementPageView("How Good Were The Invincibles?", "arsenal-bloke").then(
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
                            How Good Were The Invincibles?
                        </div>
                        <div className="blog-date">
                            Date: 9/5/2021
                        </div>
                        <div className="blog-content">
                            <div className="blog-section">
                                <div className="blog-subheader">
                                    The Invincibles
                                </div>
                                <div className="blog-content">
                                    The Invincibles are a title held by 2 English top flight teams. The original Invincibles were Preston North End in 1889 when they went undefeated in both league and cup competition for an entire season. More recently, Arsenal's 2003/2004 squad hold the mantle of the Invincibles going the entire premiere league season without a loss. We're going to explore how good the Invincibles actually were compared to years past.
                                </div>
                            </div>
                            <div className="blog-section">
                                <div className="blog-subheader">
                                    Setting the Stage
                                </div>
                                <div className="blog-content">
                                    The focus of this deep dive is on the 03/04 premiere league season. The Invincible’s went on to accomplish records outside of the PL, but almost everything here is focused on the PL season.
                                    <br/>
                                    <br/>
                                    Man United are the defending champs, beating Arsenal by 5 points in the previous season. The four champions league teams were Manchester United, Arsenal, Newcastle, and Chelsea with Liverpool and Blackburn getting Europa League spots. Notable transfers coming into 03/04 were:
                                    <ul>
                                        <li>United purchased Cristiano Ronaldo for $21M and Beckam had left for Real Madrid</li>
                                        <li>Arsenal purchased Jose Reyes, Jens Lehman, and Gael Clichy</li>
                                        <li>Chelsea purchased Makelele, Veron, Crespo, Joe Cole, and Glen Johnson(YPOTY - 03/04)</li>
                                        <li>Spurs signed Jermain Defoe for $12M</li>
                                        <li>City’s biggest transfer was Claudio Reyna for $4M</li>
                                        <li>James Milner and Aaron Lennon were purchased by Leeds</li>
                                    </ul>
                                    The Chelsea lineup had the likes of Desailey, Makelele, Terry, Lampard, Petit, and Crespo with Robert Huth on their bench, one of the center backs who led Leicester to their 2016 title. The Manchester United squad was also filled with legends like Ferdinand, Van Nistelrooy, Scholes, and Giggs with Ole Gunnar Solskjær making 13 appearances. Additionally, Rooney was playing his last season for Everton prior to moving to United. 
                                </div>
                            </div>
                            <div className="blog-section">
                                <div className="blog-subheader">
                                    The 03/04 Results
                                </div>
                                <div className="blog-content">
                                    Arsenal won the season with 4 games left to play with 90 points in total, 26 wins, 12 ties and 0 losses. Arsenal had only 2 more wins than 2nd place Chelsea, but Chelsea had the second fewest losses with 7 and finished with 79 points. Thierry Henry scored 30 goals and 6 assists in his 37 games played winning the Golden Boot and having the highest combined goal+assist value in the league involved in half of Arsenal’s 73 goals. Jens Lehmann won the Golden Glove(not yet introduced) with 15 clean sheets in his inaugural season with the Gunners and played in all 38 games. Robert Pires led the tally behind Henry with 14 goals and 8 assists. No other Arsenal player scored more than 5 goals. The most popular lineup Arsenal played was a modified 4-3-3, a 4-4-1-1. 
                                    <br/>
                                    <br/>
                                    <div style={{textAlign: "center"}}>
                                        <div>
                                            Pires - Henry - Ljungberg
                                        </div>
                                        <br/>
                                        <div>
                                            Vieira(C) - Bergkamp - Silva
                                        </div>
                                        <br/>
                                        <div>
                                            Cole - Touré - Campbell - Lauren
                                        </div>
                                        <br/>
                                        <div>
                                            Lehmann
                                        </div>
                                    </div>
                                    <br/>
                                    <table className="league-table">
                                        <thead>
                                            <tr>
                                                <th>Pos</th>
                                                <th>Team</th>
                                                <th>W</th>
                                                <th>D</th>
                                                <th>L</th>
                                                <th>GF</th>
                                                <th>GA</th>
                                                <th>GD</th>
                                                <th>P</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>1</td>
                                                <td className="team-name">Arsenal</td>
                                                <td>26</td>
                                                <td>12</td>
                                                <td>0</td>
                                                <td>73</td>
                                                <td>26</td>
                                                <td>47</td>
                                                <td>90</td>
                                            </tr>
                                            <tr>
                                                <td>2</td>
                                                <td className="team-name">Chelsea</td>
                                                <td>24</td>
                                                <td>7</td>
                                                <td>7</td>
                                                <td>67</td>
                                                <td>30</td>
                                                <td>37</td>
                                                <td>79</td>
                                            </tr>
                                            <tr>
                                                <td>3</td>
                                                <td className="team-name">Man United</td>
                                                <td>23</td>
                                                <td>6</td>
                                                <td>9</td>
                                                <td>64</td>
                                                <td>35</td>
                                                <td>29</td>
                                                <td>75</td>
                                            </tr>
                                            <tr>
                                                <td>4</td>
                                                <td className="team-name">Liverpool</td>
                                                <td>16</td>
                                                <td>12</td>
                                                <td>10</td>
                                                <td>55</td>
                                                <td>37</td>
                                                <td>18</td>
                                                <td>60</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="blog-section">
                                <div className="blog-subheader">
                                    How Close Were The Invincibles to Losing
                                </div>
                                <div className="blog-content">
                                    Throughout the season, Arsenal only trailed for 233 minutes, less than 7% of total play time, the longest stint being against Spurs for 64 minutes, 27% of the total time. Arsenal never trailed by more than a single goal and won 4 of their 6 games against the top 4 opponents, beating Chelsea and Liverpool on both occasions and tying United twice. There were 3 games during the season when the undefeated streak were in trouble. Sept 12th against Portsmouth, Arsenal went down and Henry had the only chance for Arsenal at the spot which he finished in the first half to turn the game level. Arsenal tied Portsmouth again on May 4th and Lehmann saved an opportunity 1v1 in order to ensure a draw. The closest Arsenal got to losing in the Premiere League was against Manchester United on Sept 21st, referred to as The Battle of Old Trafford. The game went back and forth, but was generally dominated by United. Patrick Vieira was eventually sent off in the 80th minute and in the 90th minute, Diego Forlan was fouled in the box to send Ruud Van Nistelrooy to the spot. Van Nistelrooy slammed the shot off the crossbar solidifying the 0-0 result. Other than these 3 games, Arsenal either won or tied comfortably, led by Sol Campbell, Kolo Touré, and Patrick Vieira. 
                                </div>
                            </div>
                            <div className="blog-section">
                                <div className="blog-subheader">
                                    How Do The Invincibles Compare
                                </div>
                                <div className="blog-content">
                                    The Invicibles broke 1 Premiere League record, the record for fewest losses. They scored 73 goals, conceded 26, and kept 15 clean sheets. There are 3 teams that followed the Invincibles that are worth statistically comparing to the Invincibles which is Chelsea’s the following season, 04/05, Manchester City’s 17/18 season, and Liverpool’s 18/19 season chosen because those teams have the second fewest losses in history. Chelsea’s 04/05 squad had 1 loss, conceded 15 goals and kept 24 clean sheets, the fewest in premiere league history losing only to Manchester City. Chelsea finished the league with 95 points beating Arsenal by 12 points and United by 18 points. Liverpool’s 18/19 season was probably one of the greatest seasons to ever be played without winning the title. Liverpool had 1 loss, 97 points, 89 goals, 22 goals conceded, the Golden Glove winner, 2 Golden Boot winners, and the PFA Player of the Year. They lost to Manchester City by 1 point making them the only team to lose the league after getting at least 90 points. The final team to discuss are The Centurions, Manchester City’s 17/18 season where they broke the league record for points with 100, the first and only in history to do it. They also scored the most goals in history with 106 and had the top 4 league leaders in assists, combining for 53 assists. Additionally, City broke the record for most wins, most consecutive wins(18), highest goal differential(+79), fewest minutes behind in matches(153), and largest winning points margin(+19).
                                    <br/>
                                    <br/>
                                    The Invincibles don’t compare to the best teams in Premiere League history… they aren’t as good. Since 2003, the average stats for a winning team was 89 points, 27 wins, 4 losses, and 83 goals. Compare that to Arsenal’s 03/04 season of 90 points, 26 wins, 0 losses, and 73 goals, they are a bang average league champion. With 12 ties, Arsenal played everything right and with the right amount of luck and grit, pulled out an undefeated season. They would have lost the 17/18, 18/19, and 19/20 season with those results and in fact would have gotten 3rd place 18/19. The gaps showed during the 03/04 season, they lost to United in the FA Cup knockout stages 1-0, lost twice to Inter in the Champions League group stage, once 3-0 and the other 5-1, and lost to Chelsea in the Champions League Semi-Final second leg 2-1.
                                </div>
                                <div className="blog-section">
                                    <div className="blog-subheader">
                                        What I Learned
                                    </div>
                                    <div className="blog-content">
                                        Arsenal had Thierry Henry, and after watching the 03/04 highlights, you realize how absurdly good this guy was. He scored no fewer than 6 goal of the season contenders in today’s game and was the type of striker who could do it all on his own. Back that with Bergkamp and Pires and you have a deadly combination. Harden the team with the likes of Campbell, Vieira, and Touré, and you have a team deserving of a league title. They weren’t the best in history, but they would compete with the best teams of today.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default HowGoodWereTheInvincibles;