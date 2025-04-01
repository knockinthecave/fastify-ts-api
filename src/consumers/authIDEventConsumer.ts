import { Kafka } from 'kafkajs';
import { AuthIDEventData } from '../types/kafka';

const kafka = new Kafka({
    clientId: 'auth-id-event-consumer',
    brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'auth-id-event-group' });

export const startAuthIDEventConsumer = async () => {
    await consumer.connect();
    console.log('🚀 Kafka consumer connected');

    await consumer.subscribe({ topic: 'auth-id-events', fromBeginning: true });
    console.log('📡 Subscribed to topic: auth-id-events');

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = message.value?.toString();
          if (value) {
            const data: AuthIDEventData = JSON.parse(value);
            console.log('📥 Received Kafka message:', data);
          }
        },
      });
    };