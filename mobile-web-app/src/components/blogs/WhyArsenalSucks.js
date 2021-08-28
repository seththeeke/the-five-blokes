import React from 'react';
import './../../css/BlogPage.css';
import CircularProgress from '@material-ui/core/CircularProgress';

class WhyArsenalSucks extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoadingWebsite: true,
            spotifyEpisodeLink: "",
            pageViews: ""
        }
    }

    componentDidMount(){
        this.props.pageViewService.incrementPageView("4 Reasons Arsenal Suck and Why It's Okay", "arsenal-bloke").then(
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
                            4 Reasons Arsenal Suck and Why It's Okay
                        </div>
                        <div className="blog-date">
                            Date: 8/28/2021
                        </div>
                        <div className="blog-content">
                            <div className="blog-section">
                                <div className="blog-subheader">
                                    The Expectations
                                </div>
                                <div className="blog-content">
                                    Expectations are incorrect for Arsenal, the club aren't actually a decorated club in todays definition. Arsenal is still trying to live up to the invincibles season 20 years later and Thierry Henry tricked an entire planet into thinking Arsenal are a world class club. Arsenal have 13 top flight titles all time, 3rd most all time but haven't won a title since 2003. Of those 13 titles, only 4 have been won since 1990 and nearly no shot since the likes of Man City and Chelsea have become regular threats to the title starting in 2010. Arsenal have no UEFA titles and have lived off of FA Cups and Community Shields as their only form of succcess since their last premiere league title. As Arsenal approaches 20 years without a premiere league title, expectations need to be adjusted. Arsenal aren't the club that compete for a title each year anymore, but that doesn't mean they should be as bad as they are today. With the money backing Arsenal and the amount of supporters they have, they will be back on top eventually, but expectations shouldn't be anytime soon.
                                </div>
                            </div>
                            <div className="blog-section">
                                <div className="blog-subheader">
                                    The Shape
                                </div>
                                <div className="blog-content">
                                    The 5-4-1, 3-5-2, or other various of 3 back formations has increased in popularity since Pep took over City in 2016. Pep almost exclusively plays a 4-3-3 variation with high attacking wingers, wide backs who support the attack, but primary responsibility is defense, and relies heavily on the best midfielder on the planet paired with balanced box-to-box supporting cast. At barcelona, Xavi, Iniesta, Busquets, at Bayern, Kroos, Lahm, Schweinsteger, and Thiago and at City, KDB, Gundagon, Silva, and Fernandinho. Jurgen Klopp is the only one who runs a similar system with such consistency and success in today’s game between BVB and Liverpool.
                                    <br/>
                                    <br/>
                                    With Pep’s rise in the PL, more defensive managers have been employed and more defensive tactics have been used across the board, especially by the less talented teams. Louis Van Gaal had success for the dutch team and experimented with 3 back at United and Conte made it a staple in Chelsea’s winning season. In 2017, the season following Conte’s title and Pep’s first title year, 17 of 20 clubs used a 3 or 5 back formation at least once.
                                    <br/>
                                    <br/>
                                    In order to be successful in a 3/5 back formation, you need at least 2 things. SOLID center backs with at least one out and out leader in that line. With 3 in the back, you are inviting crosses from the wings and if you aren’t tied together appropriately and have center backs out for blood, you will concede chances. The second thing you need is a reliable defensive midfield who know when to fill gaps from the wide areas and middle, when to make challenges, and how to distribute the ball effectively.
                                    <br/>
                                    <br/>
                                    Arsenal conceded 48 goals in 2020 and 20+ of them were from set pieces. That doesn’t count the numerous other goals conceded from crosses during open play. At the Arsenal game this Saturday(8/28/2021), Arsenal conceded 12 corner kicks and conceded 4 of their 5 goals from crosses or wing play. The staples of Arsenal's midfield have included the likes of Granit Xhaka, Mohammed El Neny, Ceballos, Emith Smith-Rowe, and Lucas Torreira over the past 4 years. Granit Xhaka has gotten 4 red cards in 5 seasons, Mohammed El Neny, Ceballos, and Torreira are regularly on loan and Emil Smith-Rowe is a young talent who appears to be a shining light for the future.
                                    <br/>
                                    <br/>
                                    The 3/5 back formation doesn’t work for Arsenal’s roster. The 3 CBs Arsenal have don’t have enough experience or vigor to hold down a line with crosses coming from left and right. Additionally, Arsenal’s midfielders are flat our not good enough to hold down the midfield with 2 center mids. With disciplinary issues and lack of quality, its just not possible. 
                                    <br/>
                                    <br/>
                                    Arsenal need to give up the 3-back formation, they’ve conceded 10 goals in their first 3 games so if preventing teams from conceding is the goal, it isn’t working. Leno is a good goalkeeper and between Rob Holding, Gabriel, and Ben White, Arsenal should be able to field 2 decent center backs. Additionally, Kieran Tierney looks like one of the league’s best left backs. Thomas Partey is a high quality central midfielder who brings grit to the team as well as quality distribution and an occasional goal and Martin odegaard is not world class by any means, but can be a good compliment to Smith-Rowe. By playing a 4-3-3, with defense first wing backs, Arsenal can lean on the likes of Saka, Aubemeyang, Pepe, and Lacazette as a front 3 rotation to provide an attacking threat. A new formation would drastically change the look of this Arsenal team for the better.
                                </div>
                            </div>
                            <div className="blog-section">
                                <div className="blog-subheader">
                                    The Manager
                                </div>
                                <div className="blog-content">
                                    Arsene Wenger is an Arsenal legend, no one can deny that. Arsene left in 2018, followed by Unai Emery and then Mikel Arteta. Alex Ferguson left United in 2013. Following his departure, they have had 4 managers and in the first 4 years of his departure, they finished 7th, 4th, 5th, and 6th and winning only an FA Cup and a Community Shield. Those results were following Ferguson's final season which was a title year for United. United hired 3 reputable manager’s before turning to an ex-player to lead the club as they have today.
                                    <br/>
                                    <br/>
                                    Arsenal’s first four years following Wenger’s departure resulted in 6th, 5th, 8th, and 8th place finishes and winning an FA Cup and 2 Community Shields. This was following a 5th place finish for Wenger’s last season. Arguably, United haven’t found their long term manager and its been 8 years since their legend departed. We can’t expect Arsenal to find a manager of Wenger’s quality for some time. 
                                    <br/>
                                    <br/>
                                    For anyone who denies Wenger’s quality, Wenger has the second most PL titles in history as a manager, tied with Jose and Pep, and behind Alex Ferguson who will likely never be beaten. Wenger also has the most FA Cup titles in PL history, most games managed in history, and 2nd most wins in PL history(476). 
                                    <br/>
                                    <br/>
                                    Mikel Arteta isn’t good enough, he needs replaced, but he will be replaced with the right man to do the job. Arsenal’s lack of grit and discipline is an indicator that they need a manager with an old school style. A traditional Italian or German style of play, getting back to the basics of the game and finding players who know the fundamentals and have the experience to let the more creative players do what they must. 
                                </div>
                            </div>
                            <div className="blog-section">
                                <div className="blog-subheader">
                                    The Transfers
                                </div>
                                <div className="blog-content">
                                    Arsenal have the most expensive season tickets out of any club in the premiere league. Effectively double that of Man U, Man City, Chelsea, and Liverpool… Arsenal is worth ~2.8 billion dollars, 5th most valuable club in england behind the four clubs above with an estimated operating income of around $47M, 4th highest among English clubs. Since 2010, Arsenal have signed 7 center backs that were considered 1st team players from the clubs they were signed from. However, Arsenal's backline regulars are still Calum Chambers and Rob Holding, players who have a combined transfer value of $25M as opposed to the 7 other center backs around $225M. As much criticism as Arsenal gets, on the attacking side, they have done good business, Ozil, Sanchez, Aubemeyang, Lacazette, and Giroud have all been good purchases over the years and Pepe still has time to develop. Those successes have been from getting players who are proven in their respective leagues not just for a season, but for a number of seasons. Players in their prime, costing a lot of money, but worth it in the end. Arsenal need to sign a World Class midfielder and a World Class center back and their team would be completely different. A player of the likes of Varane, Sule, Marquinhos, Diego Carlos, or De Ligt. In the midfield, Kimmich, Casemiro, Goretzka, or Verrati. That would be a $200M summer transfer window, but it would completely change the look of the team if we can keep the talent in the team today. The good news is that Arsenal do have a history of making significant changes in the eyes of adversity, assuming a new manager is hired, an overhaul could be in place and Arsenal could splash the cash on the right positions, but with Aubemeyang aging, there is a risk we fall into Lacazette being out starter and performing in a “Giroud” role for the remainder of his career. 
                                    <br/>
                                    <br/>
                                    Potential Lineup
                                    <br/>
                                    <br/>
                                    <div style={{textAlign: "center"}}>
                                        <div>
                                            Saka - Aubemeyang - Pepe
                                        </div>
                                        <br/>
                                        <div>
                                            Odegaard - Partey - Goretzka/Kimmich/Verrati
                                        </div>
                                        <br/>
                                        <div>
                                            Tierney - Marquinhos/De Ligt/Diego Carlos - White - Bellerin
                                        </div>
                                        <br/>
                                        <div>
                                            Leno
                                        </div>
                                    </div>
                                    <br/>
                                    Notable transfers that didn’t work out or have yet to work out since 2010:
                                    <ul>
                                        <li>Pepe - $88M - 25G 16A in 92 Games</li>
                                        <li>White - $65M</li>
                                        <li>Partey - $55M</li>
                                        <li>Xhaka - $50M - 13G 20A in 224 Games</li>
                                        <li>Mustafi - $45M - 118GC in 102 PL Games</li>
                                        <li>Odegaard - $39M</li>
                                        <li>Mkhitaryan - $38M - 9G 13A in 59 Games</li>
                                        <li>Saliba - $33M</li>
                                        <li>Torreira - $32M - 4G 6A in 89 Games</li>
                                        <li>Ramsdale - $31M</li>
                                        <li>Gabriel - $29M - 24GC in 23 PL Games</li>
                                        <li>Sokratis - $18M - 58GC in 44 PL Games</li>
                                        <li>Podolski - $17M - 31G 17A in 82 Games</li>
                                        <li>Luiz - $10M - 56GC in 53 PL Games</li>
                                    </ul>

                                    Value Add Transfers since 2010
                                    <ul>
                                        <li>Lacazette - $58M - 66G 28A in 172 Games</li>
                                        <li>Leno - $28M - 34CS in 120 Games</li>
                                        <li>Cazorla - $21M - 25G 36A in 129 Games</li>
                                        <li>Cech - $15M - 53CS in 139 Games</li>
                                        <li>Mertesacker - $13M - 74% Win Rate in 120 starts</li>
                                        <li>Giroud - $13M - 105G 41A in 253 Games</li>
                                    </ul>

                                    5 top transfers since 2010
                                    <ul>
                                        <li>Ozil - $52M - 44G 77A in 254 Games</li>
                                        <li>Koscielny - $14M - 90CS 22G in 255 Games</li>
                                        <li>Sanchez - $47M - 80G 44A in 156 Games)</li>
                                        <li>Aubameyang - $70M - 88G 20A in 151 Games</li>
                                        <li>Tierney - $30M</li>
                                    </ul>
                                </div>
                                <div className="blog-section">
                                    <div className="blog-subheader">
                                        Why It's Okay
                                    </div>
                                    <div className="blog-content">
                                        Reset your expectations of what Arsenal FC can accomplish. It's not a title contender anymore, but hasn't been for nearly 20 years. Arsenal rarely make big purchases, but when they do, they are successful, so we should be hopeful for the likes of White, Pepe, and Odegaard. Arsenal's youth is actually quite good. Saka is a starter for a fiercely competitive English side, Tierney is already one of the best left backs in the league, Emil Smith-Rowe is now a legitimate starter for the club and would start on 15 of the league's 20 clubs. Arsenal are one or two pieces away from a top 4 side, Pep is likely to leave Man City in the next 2 years, rearranging power across the big 5 leagues, likely weakening the premiere league giving Arsenal a better chance to be amongst the ranks again and re-establish the club. A new manager is likely going to happen in 2021, which is necessary and could revitalize the team and club. All of this will come, but it will take time. Arsenal are no where close to falling off the prem or losing fans, they are one of the most supported clubs in the world and are one of the top 10 most valuable clubs in the world. Clubs falling off don't happen for these type of clubs, it will just take time. So, its okay because Arsenal are performing as expected which means that once Arsenal are back on their rise, it will be that much more satisfying to see them lift the title. They will do it out of adversity and as underdogs rather than favorites making it more enjoyable, but it won't be anytime soon. 
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

export default WhyArsenalSucks;