export const authIDSchema = {
    querystring: {
        type: 'object',
        required: ['appID', 'userID'],
        properties: {
            appID: {
                type: 'string',
                description: 'The ID of the app to which the user belongs.',
            },
            userID: {
                type: 'string',
                description: 'The ID of the user to be authenticated.',
            }
        },
    },
    response: {
        200: {
            type: 'object',
            properties: {
                authID: {
                    type: 'string'
                },
            },
        },
        400: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    },
}