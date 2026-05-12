import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sellora Ecommerce API',
            version: '1.0.0',
            description: 'API documentation for Sellora Ecommerce backend',
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production' 
                     ? 'https://sellora-ecommerce-backend.onrender.com/api' // Make sure this matches the render URL
                     : 'http://localhost:6666/api',
                description: 'API Server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    apis: ['./routes/*.js'], // Path to the API docs (all files in routes folder)
};

const swaggerSpec = swaggerJSDoc(options);

export const swaggerDocs = (app) => {
    // Serve swagger UI at /api-docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    // Serve the swagger spec in JSON format
    app.get('/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log(`Swagger docs available at /api-docs`);
};
