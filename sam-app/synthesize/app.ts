import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

const polly = new AWS.Polly();
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const BUCKET_NAME = process.env.OUTPUT_BUCKET!;
const TABLE_NAME = process.env.DYNAMODB_TABLE!;

const CORS_HEADERS = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
};

interface LambdaEvent {
    name: string;
    text: string;
}

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const requestBody: LambdaEvent = JSON.parse(event.body || '{}');
        const { name, text: textToSynthesize } = requestBody;

        if (!name || !textToSynthesize) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({
                    message: 'Both "name" and "text" are required in the request body.',
                }),
            };
        }

        const pollyParams: AWS.Polly.SynthesizeSpeechInput = {
            Text: textToSynthesize,
            OutputFormat: 'mp3',
            VoiceId: 'Joanna',
        };

        const pollyResponse = await polly.synthesizeSpeech(pollyParams).promise();

        if (!pollyResponse.AudioStream) {
            throw new Error('Polly did not return audio data.');
        }

        const s3Key = `synthesized-audio-${Date.now()}.mp3`;
        const s3Params: AWS.S3.PutObjectRequest = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: pollyResponse.AudioStream as Buffer,
            ContentType: 'audio/mpeg',
        };

        await s3.upload(s3Params).promise();

        const audioUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

        const dynamoParams: AWS.DynamoDB.DocumentClient.PutItemInput = {
            TableName: TABLE_NAME,
            Item: {
                id: `audio-${Date.now()}`,
                name,
                text: textToSynthesize,
                audioUrl,
                createdAt: new Date().toISOString(),
            },
        };

        await dynamoDB.put(dynamoParams).promise();

        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                message: 'Speech synthesis complete! Click on the Refresh icon',
                audioUrl,
            }),
        };
    } catch (err) {
        console.error('Error:', err);
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({
                message: 'Internal server error.',
                error: (err as Error).message,
            }),
        };
    }
};
