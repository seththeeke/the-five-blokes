import React from 'react';
import './../../css/GameweekBadges.css';
import './../../css/DraftRoom.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';

class DraftRoom extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoadingWidget: true,
            listObjects: []
        }
        this.updateData = this.updateData.bind(this);
    }

    componentDidMount(){
        this.updateData();
    }

    componentDidUpdate(prevProps) {
        if(this.props.leagueId !== prevProps.leagueId){
            this.setState({
                isLoadingWidget: true
            });
            this.updateData();
        }
    } 

    updateData(){
        let listSubHeaderStyle = {
            backgroundColor: "white",
            fontWeight: "bold",
            fontSize: "18px"
        }
        if (this.props.leagueId){
            this.props.fplService.getDraftPicksForLeagueId(this.props.leagueId).then(function(participantsEvent){
                let draftPickData = participantsEvent.data.Items;
                let sortedPicks = draftPickData.sort(function(a, b){
                    // compare rounds
                    if (parseInt(a.round.N) < parseInt(b.round.N))
                        return -1;
                    else if (parseInt(a.round.N) > parseInt(b.round.N))
                        return 1;
                
                    // round is equal, compare pick
                    if (parseInt(a.pick.N) < parseInt(b.pick.N))
                        return -1;
                    else if (parseInt(a.pick.N) > parseInt(b.pick.N))
                        return 1;
                
                    return 0;
                });
                let listObjects = [];
                // iterate through the picks and create a list item for a pick and subheaders for each round
                let currRound = "1";
                let listItems = [];
                for (let j in sortedPicks) {
                    let pick = sortedPicks[j];
                    let round = pick.round.N;
                    if (currRound !== round){
                        listObjects.push(
                            <li key={`section-${round}`}>
                                <ul>
                                    <ListSubheader style={listSubHeaderStyle}>{`Round ${currRound}`}</ListSubheader>
                                    {listItems}
                                </ul>
                            </li>
                        );
                        listItems = [];
                        currRound = round;
                    }
                    listItems.push(
                        <ListItem key={`item-${pick.round.N}-${pick.pick.N}`}>
                            <div className="pick-container">
                                <div className="pick-number-container">{pick.pick.N}</div>
                                <div className="pick-info-container">
                                    <div className="draft-player-name-container">{pick.player_first_name.S} {pick.player_last_name.S}</div>
                                    <div className="draft-rank-container">Team: {pick.entry_name.S} Draft Rank: {pick.draft_rank.N}</div>
                                </div>
                            </div>
                        </ListItem>
                    );
                }
                this.setState({
                    isLoadingWidget: false,
                    listObjects: listObjects
                });
            }.bind(this));
        } else {
            this.setState({
                isLoadingWidget: false
            });
        }
    }

    render() {
        let tableBody = (
            <div className="no-draft-pick-data">No Draft Pick Data Available</div>
        );
        if (this.state.listObjects.length > 0){
            tableBody = (
                <List subheader={<li />}>
                    {this.state.listObjects}
                </List>
            );
        }
        return (
            <div className='gameweek-badges-container'>
                <div className="page-spinner-container" hidden={!this.state.isLoadingWidget}>
                    <CircularProgress></CircularProgress>
                </div>
                <div className="gameweek-badges-wrapper" hidden={this.state.isLoadingWidget}>
                    <div className="gameweek-badges-title-container">
                        Draft Room 
                    </div>
                    <div className="gameweek-badge-list" hidden={this.state.isLoadingWidget}>
                        {tableBody}
                    </div>
                </div>
            </div>
        );
    }
}

export default DraftRoom;