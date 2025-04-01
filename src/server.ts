import Fastify from 'fastify';
import { kafkaProducer } from './utils/kafkaProducer';
import { authIDRoutes } from './controllers/account/accountAuth/authID/authID.routes';
import { startAuthIDEventConsumer } from './consumers/authIDEventConsumer';

/**
 * @description Setup Fastify server
 * @author 이성범
 */

const app = Fastify({ logger: true });

startAuthIDEventConsumer();

app.register(authIDRoutes, {
  prefix: '/api/v1',
});

app.get('/ping', async (request, reply) => {
  return { message: 'pong' };
});

/**
 * @description Kafka 종료 후 등록
 */
app.addHook('onClose', async () => {
  await kafkaProducer.disconnect();
  app.log.info('Kafka producer disconnected');
});

const start = async () => {
  try {
    await app.listen({ port: 8080, host: '0.0.0.0' });
    console.log('🚀 Fastify server running on http://localhost:8080');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
