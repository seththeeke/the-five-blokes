import React from 'react';
import './../css/LeagueHistory.css';
import nathanVid from '../vid/Nathan-2019.mov';
import evan2019 from '../img/2019-evan.jpg';

class LeagueHistory extends React.Component {
    render() {
        let leagueHistory = this.getLeagueHistory();
        let historyRows = [];
        for (let i in leagueHistory){
            let yearResults = leagueHistory[i];
            historyRows.push(
                <div className="league-container" key={yearResults.year}>
                    <div className="year-container">{yearResults.year}</div>
                    <div className="history-container">
                        <div className="title-container">Winner</div>
                        <div>{yearResults.winner.name}</div>
                        <img className="history-media" alt={yearResults.winner.name} src={yearResults.winner.image}></img>
                    </div>
                    <div className="history-container">
                        <div className="title-container">Loser</div>
                        <div>{yearResults.loser.name}</div>
                        <video className="history-media" controls>
                            <source src={yearResults.loser.forfeit} type="video/mp4"/>
                        </video>
                    </div>
                </div>
            );
        }
        return (
            <div className="league-history-container">
                <div className="league-history-title-container">League History</div>
                {historyRows}
            </div>
        );
   }

   getLeagueHistory(){
       return [
           {
               year: "2019",
               winner: {
                   name: "Evan Stalnaker",
                   image: evan2019
               },
               loser: {
                   name: "Nathan Lawer-Yolar",
                   forfeit: nathanVid
               }
           }
       ]
   }

}
export default LeagueHistory;