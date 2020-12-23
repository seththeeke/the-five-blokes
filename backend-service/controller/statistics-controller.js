var statisticsService = require('./../services/statistics-service');

exports.triggerGenerateStatisticsController = async (event) => {
    console.log(JSON.stringify(event));
    try {
        let response = await statisticsService.triggerGenerateStatistics();
        return respond(response);
    } catch (err){
        return error(err);
    }
}

exports.generateStatisticsController = async (event) => {
    console.log(JSON.stringify(event));
    try {
        let response = await statisticsService.generateStatistics();
        return respond(response);
    } catch (err){
        return error(err);
    }
}

function respond(responseData){
    return {
        'statusCode': 200,
        'body': JSON.stringify({
            'data': responseData
        }),
        'headers': {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        }
    };
}

function error(message){
    console.log(message);
    return {
        'statusCode': 500,
        'body': JSON.stringify({
            'err': message
        }),
        'headers': {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        }
    };
}