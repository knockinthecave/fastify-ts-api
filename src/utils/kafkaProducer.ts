import { Kafka, Producer } from 'kafkajs';
import { AuthIDEventData, EventLogData } from '../types/kafka';

const kafka = new Kafka({
    clientId: 'fastify-api',
    brokers: ['3.35.147.189:9092'],
})

export const kafkaProducer: Producer = kafka.producer();

let isConnected = false;

export const sendAuthIDEvent = async (data: AuthIDEventData): Promise<void> => {
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

export const kafkaEventLogProducer = async (data: EventLogData): Promise<void> => {
    if (!isConnected) {
        await kafkaProducer.connect();
        isConnected = true;
    }
    console.log('🚀 Kafka producer connected');

    try {
        await kafkaProducer.send({
            topic: 'event-log',
            messages: [
                {
                    key: data.header.authorization,
                    value: JSON.stringify(data),
                },
            ]
        });
    } catch (err) {
        console.error('❌ Error sending message to Kafka:', err);
    }
};