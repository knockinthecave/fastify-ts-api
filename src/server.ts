import Fastify from 'fastify';
import { registerSwagger } from './plugins/swagger';
import { kafkaProducer } from './utils/kafkaProducer';
import { authIDRoutes } from './controllers/account/accountAuth/authID/authID.routes';
import { startAuthIDEventConsumer } from './consumers/authIDEventConsumer';
import { requestCounter, requestDuration, metricsEndpoint } from './utils/metrics';

const app = Fastify({ logger: true, trustProxy: true });

/**
 * @description 서버 초기화 함수
 * @author 이성범
 * @date 2024-04-01
 */
const start = async () => {
  try {
    await startAuthIDEventConsumer();
    await registerSwagger(app);
    app.register(authIDRoutes, {
      prefix: '/api/v1',
    });

    /**
     * @description Prometheus 메트릭을 수집하는 엔드포인트
     */
    app.get('/metrics', metricsEndpoint);

    app.addHook('onRequest', async (request) => {
      (request as any).startTime = process.hrtime();
    });
      

    app.addHook('onResponse', async (request, reply) => {
      const method = request.method;
      const route = request.routeOptions?.url || request.url;

      // ✅ Prometheus에서는 labels에 문자열만 허용하므로, 숫자형을 문자열로 변환
      const statusCode = reply.statusCode.toString();
      if (route === '/metrics') return;

      // 요청 시간 측정
      const diff = process.hrtime((request as any).startTime);
      const responseTimeInSeconds = diff[0] + diff[1] / 1e9;

      // 요청 수 카운터 증가
      requestCounter.labels(method, route, statusCode).inc();
      requestDuration.labels(route).observe(responseTimeInSeconds);
      console.log(`[${route}] duration: ${responseTimeInSeconds * 1000}ms`);
    });

    app.get('/ping', async () => {
      return { message: 'pong' };
    });

    app.addHook('onClose', async () => {
      await kafkaProducer.disconnect();
      app.log.info('Kafka producer disconnected');
    });

    await app.listen({ port: 8080, host: '0.0.0.0' });
    console.log('🚀 Fastify server running on http://localhost:8080');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
