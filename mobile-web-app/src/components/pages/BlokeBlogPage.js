import React from 'react';
import './../../css/BlokeBlogPage.css';
import CircularProgress from '@material-ui/core/CircularProgress';

class BlokeBlogPage extends React.Component {
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
        let blogContentList = [];
        for (let i in this.props.blogContent){
            let link = window.location.href + this.props.blogContent[i].url;
            let key = "blogPost" + i;
            blogContentList.push(
                <div key={key} className="blog-list-item">
                    <div className="list-item-publish-date">{this.props.blogContent[i].publishDate}</div>
                    <a className="blog-link" href={link}>{this.props.blogContent[i].title}</a>
                </div>
            )
        }
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
                    <div className="blog-list">
                        {blogContentList}
                    </div>
                </div>
            </div>
        );
    }
}

export default BlokeBlogPage;