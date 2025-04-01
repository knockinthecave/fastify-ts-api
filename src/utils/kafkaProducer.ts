import { Kafka, Producer } from 'kafkajs';
import { AuthIDEventData } from '../types/kafka';

const kafka = new Kafka({
    clientId: 'fastify-api',
    brokers: ['kafka:9092'],
})

export const kafkaProducer: Producer = kafka.producer();

let isConnected = false;

export const sendAuthIDEvent = async (data: AuthIDEventData) => {
    if (!isConnected) {
        await kafkaProducer.connect();
        isConnected = true;
    }
    console.log('🚀 Kafka producer connected');

    try {
        await kafkaProducer.send({
            topic: 'auth-id-events',
            messages: [
                {
                    key: data.appID,
                    value: JSON.stringify(data),
                },
            ],
        });
        console.log('✅ Message sent to Kafka:', data);
    } catch (err) {
        console.error('❌ Error sending message to Kafka:', err);
    }
};