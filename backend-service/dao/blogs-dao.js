var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    addPageView: async function(pageTitle, owner){
        let existingPage = await this.getBlogPostByTitle(pageTitle);
        if (existingPage.Items.length > 0){
            existingPage = existingPage.Items[0];
            return await this._incrementPageView(existingPage)
        } else {
            return await this._addNewPage(pageTitle, owner);
        }
    },

    getBlogPostByTitle: async function(title){
        let params = {
            FilterExpression: "title = :title",
            ExpressionAttributeValues: {
              ":title": { S: title }
            },
            TableName: process.env.BLOG_POST_TABLE_NAME,
        };
        let blog = await ddb.scan(params).promise();
        return blog;
    },

    _addNewPage: async function(pageTitle, owner){
        let addPageParams = {
            Item: {
                "id": {
                    S: pageTitle
                },
                "title": {
                    S: pageTitle
                },
                "owner": {
                    S: owner
                },
                "pageViews": {
                    N: "1"
                }
            },
            TableName: process.env.BLOG_POST_TABLE_NAME
        }
        let addPageResponse = await ddb.putItem(addPageParams).promise();
        return addPageParams;
    },

    _incrementPageView: async function(existingPage){
        existingPage.pageViews.N = (parseInt(existingPage.pageViews.N) + 1).toString();
        let incrementPageView = {
            Item: existingPage,
            TableName: process.env.BLOG_POST_TABLE_NAME
        }
        let incrementPageViewResponse = await ddb.putItem(incrementPageView).promise();
        return incrementPageView;
    }
}