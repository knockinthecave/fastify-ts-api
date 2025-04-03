import { FastifyRequest, FastifyReply } from 'fastify';
import { getAuthID } from './authID.service';
import { sendAuthIDEvent, kafkaEventLogProducer } from '../../../../utils/kafkaProducer';

type RequestQuery = {
    appID: string;
    userID: string;
}

export const authIDHandler= async (
    req: FastifyRequest<{ Querystring: RequestQuery }>, 
    reply: FastifyReply
) => {
    const { appID, userID } = req.query;

    if (!appID || !userID) {
        return reply.status(400).send({ message: 'appID and userID are required.' });
    }

    const startTime = process.hrtime();

    try {
        const result = await getAuthID(appID, userID);

        await sendAuthIDEvent({
            appID,
            userID,
            authID: result.authID
        });

        const diff = process.hrtime(startTime);
        const responseTimeMs = diff[0] * 1000 + diff[1] / 1e6; // ms로 변환

        await kafkaEventLogProducer({
            header: {
                authorization: req.headers['authorization'] || '',
                xForwardedFor: req.headers['x-forwarded-for'] || req.ip ||'',
                userAgent: req.headers['user-agent'] || '',
                contentType: req.headers['content-type'] || ''
            },
            data: {
                appID,
                userID,
                authID: result.authID
            },
            path: req.routeOptions.url ?? req.url,
            method: req.method,
            statusCode: reply.statusCode,
            responseTime: responseTimeMs
        });

        return reply.status(200).send({
            authID: result.authID
        });
    }
    catch (error) {
        console.error('Error retrieving AuthID:', error);
        return reply.status(500).send({ message: 'Internal Server Error' });
    }
}