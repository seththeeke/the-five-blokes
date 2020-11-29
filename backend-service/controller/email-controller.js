var emailService = require('./../services/email-service');

exports.sendGameweekProcessingCompletedEmailController = async (event) => {
    console.log(JSON.stringify(event));
    let response = await emailService.sendGameweekProcessingCompletedEmail();
    return response;
}