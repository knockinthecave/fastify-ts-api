import { FastifyInstance } from 'fastify';
import { authIDHandler } from './authID.controller';
import { authIDSchema } from './authID.schema';

export async function authIDRoutes(fastify: FastifyInstance) {
    fastify.get('/account/accountAuth/authID', {
        schema: authIDSchema,
        handler: authIDHandler,
    });
}