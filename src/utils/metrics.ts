import { Counter, Histogram, Registry } from 'prom-client';
import { FastifyRequest, FastifyReply } from 'fastify';

export const register = new Registry();

/**
 * @description 📊 HTTP 요청 수를 측정하는 카운터
 */
export const requestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
});

/**
 * @description ⏱️ HTTP 요청의 응답 시간을 측정하는 히스토그램
 */
export const requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['route'],
    buckets: [0.1, 0.5, 1, 2, 5, 10], // 매우 빠른 응답 ~ 매우 느린 응답까지 측정하기 위한 구간
    registers: [register],
});

/**
 * @description 📊 Prometheus 메트릭을 수집하는 엔드포인트
 */
register.registerMetric(requestCounter);
register.registerMetric(requestDuration);

export const metricsEndpoint = async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    reply.header('Content-Type', register.contentType);
    reply.send(await register.metrics());
};
