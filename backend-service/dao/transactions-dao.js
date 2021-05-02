var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    addNewTransaction: async function(id, foreignId, foreignPlayerIdIn, foreignPlayerIdOut, leagueEntryId, result, leagueId, transactionRequestedDateTime){
        let newTransactionParams = {
            Item: {
                "id": {
                    S: id.toString()
                },
                "foreignId": {
                    S: foreignId.toString()
                },
                "foreignPlayerIdIn": {
                    S: foreignPlayerIdIn.toString()
                },
                "foreignPlayerIdOut": {
                    S: foreignPlayerIdOut.toString()
                },
                "leagueEntryId": {
                    S: leagueEntryId.toString()
                },
                "result": {
                    S: result.toString()
                },
                "leagueId": {
                    S: leagueId.toString()
                },
                "transactionRequestedDateTime": {
                    S: transactionRequestedDateTime.toString()
                }
            },
            TableName: process.env.TRANSACTIONS_TABLE_NAME
        }
        let newTransactionResponse = await ddb.putItem(newTransactionParams).promise();
        console.log("Added new transaction: " + JSON.stringify(newTransactionParams));
    },

    getAllTransactions: async function(){
        let transactionScanParams = {
            TableName: process.env.TRANSACTIONS_TABLE_NAME
        }
        let allTransactionsResponse = await ddb.scan(transactionScanParams).promise();
        return allTransactionsResponse;
    },

    getAllTransactionsForLeagueId: async function(leagueId){
        let params = {
            FilterExpression: "leagueId = :leagueId",
            ExpressionAttributeValues: {
              ":leagueId": { S: leagueId }
            },
            TableName: process.env.TRANSACTIONS_TABLE_NAME,
        };
        let filteredTransactionsResponse = await ddb.scan(params).promise();
        return filteredTransactionsResponse;
    }
}