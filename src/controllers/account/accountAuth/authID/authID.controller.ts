import { FastifyRequest, FastifyReply } from 'fastify';
import { getAuthID } from './authID.service';
import { sendAuthIDEvent } from '../../../../utils/kafkaProducer';
import { eventLogger, getLogLevel } from '../../../../utils/logger';

type RequestQuery = {
    appID: string;
    userID: string;
}

export const authIDHandler= async (
    req: FastifyRequest<{ Querystring: RequestQuery }>, 
    reply: FastifyReply
): Promise<FastifyReply> => {
    const query = req.query;

    if (!query?.appID || !query?.userID) {
        return reply.status(400).send({ message: 'appID and userID are required.' });
    }

    const startTime = process.hrtime();

    try {
        const result = await getAuthID(query.appID, query.userID);
        const level = getLogLevel(reply.statusCode);
        
        await sendAuthIDEvent({
            appID: query.appID,
            userID: query.userID,
            authID: result.authID
        });

        await eventLogger(req, reply, level, { 
            appID: query.appID,
            userID: query.userID,
            authID: result.authID
        }, startTime);

        return reply.status(200).send({
            authID: result.authID
        });
    }
    catch (err: any) {
        const level = getLogLevel(reply.statusCode);
        
        await eventLogger(req, reply, level, {
            error: err?.message || 'Error retrieving authID',
            stack: err?.stack || ''
        }, startTime);

        return reply.status(500).send({ message: 'Internal Server Error' });
    }
}