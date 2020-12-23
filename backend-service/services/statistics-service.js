var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ses = new AWS.SES({apiVersion: '2010-12-01'});
var sns = new AWS.SNS({apiVersion: '2010-03-31'});
var fplService = require('./fpl-draft-service');

module.exports = {
    triggerGenerateStatistics: async function(){
        console.log("Triggering generation of statistics");
        let response = await sns.publish({
            Message: 'GenerateStats',
            TopicArn: process.env.GENERATE_STATISTICS_TOPIC_ARN
        }).promise();
        console.log("Finished publishing to topic arn: " + process.env.GENERATE_STATISTICS_TOPIC_ARN);
        return response;
    },

    generateStatistics: async function(){
        console.log("Beginning to generate statistics on demand");
        // Listen to Topic
        // Get Static Bootstrap Content
        // Current Standings
        // Top 10 Goalscorers
        // Top 10 Assists
        // Top 10 Cleansheets
        // Top 10 Tackles
        // Top 10 Fantasy Points Producers
        // Send Email
    }
}