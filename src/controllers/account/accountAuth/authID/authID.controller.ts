import { FastifyRequest, FastifyReply } from 'fastify';
import { getAuthID } from './authID.service';
import { sendAuthIDEvent } from '../../../../utils/kafkaProducer';

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
    try {
        const result = await getAuthID(appID, userID);

        await sendAuthIDEvent({
            appID,
            userID,
            authID: result.authID
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