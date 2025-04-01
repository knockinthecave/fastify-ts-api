import { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';

export const registerSwagger = async (app: FastifyInstance) => {
    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: '로컬 테스트 API',
                description: '로컬 테스트용 API 문서',
                version: '1.0.0',
            },
            tags: [
                { name: 'Account', description: 'Account 관련 API' },
            ],
            servers: [
                { 
                    url: 'http://localhost:8080', 
                    description: '로컬 서버' 
                }
            ]
        }
    });

    await app.register(fastifySwaggerUI, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: false,
        }
    });
};
