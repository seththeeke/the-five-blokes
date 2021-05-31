import React from 'react';
import './../css/EmailSubscriptionManagement.css';
import CircularProgress from '@material-ui/core/CircularProgress';

class EmailSubscriptionManagementPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoadingWebsite: true,
            email: window.location.search.substring(window.location.search.indexOf("=") + 1),
            responseSuccessful: false
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
        this.setState({
            isLoadingWebsite: true,
            responseSuccessful: false
        });
        this.props.emailSubscriptionService.subscribe(document.getElementById("emailInput").value).then(function(event){
            this.setState({
                isLoadingWebsite: false,
                responseSuccessful: true
            });
        }.bind(this));
    }

    unsubscribe(){
        this.setState({
            isLoadingWebsite: true,
            responseSuccessful: false
        });
        this.props.emailSubscriptionService.unsubscribe(document.getElementById("emailInput").value).then(function(event){
            this.setState({
                isLoadingWebsite: false,
                responseSuccessful: true
            });
        }.bind(this));
    }

    render() {
        return (
            <div className='email-subscription-container'>
                <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
                <CircularProgress></CircularProgress>
                </div>
                <div hidden={this.state.isLoadingWebsite}>
                    <div className="subscription-management-header">Follow the Five Blokes Fantasy League</div>
                    <div>
                        <input id="emailInput" className="email-input" type="text" placeholder="email" defaultValue={this.state.email}></input>
                        <div>
                            <button className="subscription-button" onClick={this.subscribe}>Subscribe</button>
                            <button className="subscription-button" onClick={this.unsubscribe}>Unsubscribe</button>
                        </div>
                    </div>
                    <div className="success-text" hidden={!this.state.responseSuccessful}>Success!</div>
                </div>
            </div>
        );
    }
}

export default EmailSubscriptionManagementPage;