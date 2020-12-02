import React from 'react';
import './../css/EmailSubscriptionManagement.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import circularLogo from "../img/circular-prem-lion.png";

class EmailSubscriptionManagementPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoadingWebsite: true,
            email: window.location.search.substring(window.location.search.indexOf("=") + 1)
        }

        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
    }

    componentDidMount(){
        this.setState({
            isLoadingWebsite: false
        });
    }

    subscribe(){
        this.props.emailSubscriptionService.subscribe(document.getElementById("emailInput").value).then(function(event){
            console.log("Success Subscribe");
        });
    }

    unsubscribe(){
        this.props.emailSubscriptionService.unsubscribe(document.getElementById("emailInput").value).then(function(event){
            console.log("Success Unsubscribe");
        });
    }

    render() {
        return (
            <div className='email-subscription-container'>
                <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
                <CircularProgress></CircularProgress>
                </div>
                <div hidden={this.state.isLoadingWebsite}>
                    <div className="logo-wrapper email-sub-logo-wrapper">
                        <img className="logo" alt="logo" src={circularLogo}></img>
                    </div>
                    <div className="subscription-management-header">Subscription Management</div>
                    <div>
                        <input id="emailInput" className="email-input" type="text" placeholder="email" defaultValue={this.state.email}></input>
                        <div>
                            <button className="subscription-button" onClick={this.subscribe}>Subscribe</button>
                            <button className="subscription-button" onClick={this.unsubscribe}>Unsubscribe</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default EmailSubscriptionManagementPage;