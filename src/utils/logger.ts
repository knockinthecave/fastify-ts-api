import { FastifyRequest, FastifyReply } from 'fastify';
import { kafkaEventLogProducer } from './kafkaProducer';

export type LogLevel = 'info' | 'error' | 'warn';

export const getLogLevel = (statusCode: number): LogLevel => {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'info';
}

export const eventLogger = async (
    req: FastifyRequest,
    reply: FastifyReply,
    data: Record<string, any> | Record<string, any>[],
    startTime: number,
): Promise<void> => {
    const responseTime = Date.now() - startTime;
    const level = getLogLevel(reply.statusCode);

    await kafkaEventLogProducer({
        level: level,
        timestamp: new Date().toISOString(),
        header: {
            authorization: req.headers['authorization'] || '',
            xForwardedFor: req.headers['x-forwarded-for'] || req.ip || '',
            userAgent: req.headers['user-agent'] || '',
            contentType: req.headers['content-type'] || ''
        },
        data,
        path: req.routeOptions?.url ?? req.url,
        method: req.method,
        statusCode: reply.statusCode,
        responseTime: responseTime
    });
}