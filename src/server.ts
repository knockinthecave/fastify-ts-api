import Fastify from 'fastify';
import { registerSwagger } from './plugins/swagger';
import { kafkaProducer } from './utils/kafkaProducer';
import { authIDRoutes } from './controllers/account/accountAuth/authID/authID.routes';
import { startAuthIDEventConsumer } from './consumers/authIDEventConsumer';

const app = Fastify({ logger: true });

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
