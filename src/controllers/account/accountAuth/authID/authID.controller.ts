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
) => {
    const { appID, userID } = req.query;

    if (!appID || !userID) {
        return reply.status(400).send({ message: 'appID and userID are required.' });
    }

    const startTime = process.hrtime();

    try {
        const result = await getAuthID(appID, userID);
        const level = getLogLevel(reply.statusCode);
        
        await sendAuthIDEvent({
            appID,
            userID,
            authID: result.authID
        });

        await eventLogger(req, reply, level, { 
            appID,
            userID,
            authID: result.authID
        }, startTime);

        return reply.status(200).send({
            authID: result.authID
        });
    }
    catch (error) {
        const level = getLogLevel(reply.statusCode);
        
        await eventLogger(req, reply, level, {
            error: 'Error retrieving AuthID',
        }, startTime);

        return reply.status(500).send({ message: 'Internal Server Error' });
    }
}