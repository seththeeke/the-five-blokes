var emailService = require('./../services/email-service');

exports.sendGameweekProcessingCompletedEmailController = async (event) => {
    console.log(JSON.stringify(event));
    let response = await emailService.sendGameweekProcessingCompletedEmail();
    return response;
}

exports.subscribe = async (event) => {
    console.log(JSON.stringify(event));
    try {
        let response = await emailService.subscribe(JSON.parse(event.body).emailAddress);
        return respond(response);
    } catch (err) {
        return error(err);
    }
}

exports.unSubscribe = async (event) => {
    console.log(JSON.stringify(event));
    try {
        let response = await emailService.unSubscribe(JSON.parse(event.body).emailAddress);
        return respond(response);
    } catch (err) {
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