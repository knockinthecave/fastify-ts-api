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

export const startAuthIDEventConsumer = async () => {
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

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
            
            if (data.userID === 'blockedUserID') {
                console.log(`🚨 ALERT! Blocked User userID: ${data.userID} detected!`);
                try {
                    await axios.post(SLACK_WEBHOOK_URL!, {
                        text: `🚨 ALERT! Blocked User userID: ${data.userID} detected!`,
                    });
                    console.log('✅ Alert sent to Slack');
                } catch (error) {
                    console.error('❌ Error sending alert to Slack:', error);
                }
            }
          }
        },
      });
    };