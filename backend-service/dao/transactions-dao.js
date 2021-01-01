var AWSXRay = require('aws-xray-sdk');
var AWS = AWSXRay.captureAWS(require('aws-sdk'));
AWS.config.update({region: process.env.AWS_REGION});
var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

module.exports = {
    addNewTransaction: async function(id, foreignId, foreignPlayerIdIn, foreignPlayerIdOut, leagueEntryId, result, leagueId, transactionRequestedDateTime){
        let newTransactionParams = {
            Item: {
                "id": {
                    S: id
                },
                "foreignId": {
                    S: foreignId
                },
                "foreignPlayerIdIn": {
                    S: foreignPlayerIdIn
                },
                "foreignPlayerIdOut": {
                    S: foreignPlayerIdOut
                },
                "leagueEntryId": {
                    S: leagueEntryId
                },
                "result": {
                    S: result
                },
                "leagueId": {
                    S: leagueId
                },
                "transactionRequestedDateTime": {
                    S: transactionRequestedDateTime
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
        let allTransactionsResponse = await ddb.scan(badgeScanParams).promise();
        let filteredTransactionsResponse = allTransactionsResponse.records.filter(function(transaction) {
            return transaction.leagueId.S == leagueId;
        });
        return filteredTransactionsResponse;
    }
}