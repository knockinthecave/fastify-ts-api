import { Counter, Registry } from 'prom-client';
import { FastifyRequest, FastifyReply } from 'fastify';

export const register = new Registry();

export const requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'duration'],
    registers: [register],
});

register.registerMetric(requestCounter);

export const metricsEndpoint = async (req: FastifyRequest, reply: FastifyReply) => {
    reply.header('Content-Type', register.contentType);
    reply.send(await register.metrics());
};
