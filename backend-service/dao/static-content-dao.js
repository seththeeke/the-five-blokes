var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var s3 = new AWS.S3({apiVersion: '2006-03-01'});

/**
 * Dao for static content s3 bucket
 */
module.exports = {
    putStaticContent: async function(object, key){
        let putObjectS3BucketParams = {
            Body: JSON.stringify(object),
            Bucket: process.env.STATIC_CONTENT_BUCKET_NAME, 
            Key: key
        }
        let s3Response = await s3.putObject(putObjectS3BucketParams).promise();
        console.log("Completed posting static content to s3 with params: " + JSON.stringify(putObjectS3BucketParams));
        return s3Response;
    },

    getStaticContent: async function(key){
        let getObjectS3BucketParams = {
            Bucket: process.env.STATIC_CONTENT_BUCKET_NAME, 
            Key: key
        }
        let s3Response = await s3.getObject(getObjectS3BucketParams).promise();
        console.log("Completed fetching static content to s3 with params: " + JSON.stringify(getObjectS3BucketParams));
        return JSON.parse(s3Response.Body);
    }
}