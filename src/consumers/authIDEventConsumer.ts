import { Kafka } from 'kafkajs';
import { AuthIDEventData } from '../types/kafka';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
    clientId: 'auth-id-event-consumer',
    brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'auth-id-event-group' });

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const ALERT_TEST_USER = 'test-user';

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
            
            if (data.userID === ALERT_TEST_USER) {
                console.log(`🚨 ALERT! userID: ${data.userID} detected!`);
            }

            // Slack 알림 전송
            try {
                await axios.post(SLACK_WEBHOOK_URL!, {
                    text: `🚨 *ALERT!* 특정 유저 감지됨\n• user_id: \`${data.userID}\``,
                });
                console.log('✅ Slack notification sent');
            } catch (error) {
                console.error('❌ Error sending Slack notification:', error);
            }
          }
        },
      });
    };