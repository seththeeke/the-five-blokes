import React from 'react';
import './../css/EmailSubscriptionManagement.css';
import EmailManagementWidget from './EmailManagementWidget';
import CircularProgress from '@material-ui/core/CircularProgress';

class EmailSubscriptionManagementPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoadingWebsite: true
        }
    }

    componentDidMount(){
        this.setState({
            isLoadingWebsite: false
        });
    }

    render() {
        return (
            <div className='email-subscription-container'>
                <div className="page-spinner-container" hidden={!this.state.isLoadingWebsite}>
                <CircularProgress></CircularProgress>
                </div>
                <div>
                    <EmailManagementWidget
                        emailSubscriptionService={this.props.emailSubscriptionService}
                    >
                    </EmailManagementWidget>
                    <div className="email-subscription-info">
                        By subscribing, you will get one <a href="https://github.com/seththeeke/last-of-the-mohigans#emails">email</a> each week and one at the end of the season. You can unsubscribe at any time.
                    </div>
                </div>
            </div>
        );
    }
}

export default EmailSubscriptionManagementPage;