var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    addEmailAddress: async function(emailAddress){
        let addEmailParams = {
            Item: {
                "emailAddress": {
                    S: emailAddress
                }
            },
            TableName: process.env.EMAIL_SUBSCRIPTION_TABLE
        }
        let addEmailResponse = await ddb.putItem(addEmailParams).promise();
        console.log("Added new email address: " + JSON.stringify(addEmailParams));
    },

    removeEmailAddress: async function(emailAddress){
        let removeEmailParams = {
            Key: {
                "emailAddress": {
                    S: emailAddress
                }
            },
            TableName: process.env.EMAIL_SUBSCRIPTION_TABLE
        }
        let removeEmailAddressResponse = await ddb.deleteItem(removeEmailParams).promise();
        console.log("Removed email address: " + JSON.stringify(removeEmailParams));
    }
}