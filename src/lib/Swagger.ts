import { createSwaggerSpec } from 'next-swagger-doc';

const apiFolder = './src/app/api'; 

export const getApiDocs = async () => {
    const spec = createSwaggerSpec({
        apiFolder,
        definition: {
            openapi: '3.0.0',
            info: {
                title: 'DevCollab API',
                version: '1.0.0',
            },
            components: {
                securitySchemes: {
                    BearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                    },
                },
            },
            security: [{ BearerAuth: [] }],
        },
    });
    return spec;
};