import * as aws from 'aws-lambda';

export const lambdaHandler = async (event: any): Promise<aws.APIGatewayProxyResult> => {
    const queries = JSON.stringify(event.thing);
    return {
        statusCode: 200,
        body: `Queries: ${queries}`
    }
}