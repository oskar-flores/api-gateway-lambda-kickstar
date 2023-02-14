import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import fetch from 'isomorphic-fetch'
import{Parser}  from 'xml2js'

const { URL } = process.env;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    if (URL != undefined) {
        const parser = new Parser();
        const xmlResponse = await fetch(URL);
        const body= await xmlResponse.text();
        const result = await parser.parseStringPromise(body);
        try {
            response = {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (err: unknown) {
            console.log(err);
            response = {
                statusCode: 500,
                body: JSON.stringify({
                    message: err instanceof Error ? err.message : 'some error happened',
                }),
            };
        }
    } else {
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: 'missing url',
            }),
        };
    }

    return response;
};
