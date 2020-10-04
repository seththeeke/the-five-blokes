import React from 'react';
import './../css/Badge.css';
import Tooltip from '@material-ui/core/Tooltip';

class Badge extends React.Component {
    constructor(props){
        super(props);
        this.showBadgeDetail = this.showBadgeDetail.bind(this);
    }

    render() {
        if (this.props.showBadgeType){
            return (
                <div className="badge-center-container">
                    <Tooltip disableFocusListener enterTouchDelay="0" title={this.props.badge.description}>
                        <img className="badge" alt={this.props.badge.badgeType} src={this.props.badge.icon} onClick={this.showBadgeDetail.bind(this.props.badge)}></img>
                    </Tooltip>
                    <span className="badge-type-container">{this.props.badge.badgeType}</span>
                </div>
            );
        }
        return (
            <div>
                <Tooltip enterTouchDelay="0" disableFocusListener title={this.props.badge.description}>
                    <img className="badge" alt={this.props.badge.badgeType} src={this.props.badge.icon} onClick={this.showBadgeDetail.bind(this.props.badge)}></img>
                </Tooltip>
            </div>
        );
   }

   showBadgeDetail(badge){
       console.log(badge);
   }

}
export default Badge;