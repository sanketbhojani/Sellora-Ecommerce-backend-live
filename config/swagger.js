import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ✅ Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
                     ? 'https://sellora-ecommerce-backend-live.onrender.com/api'
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
    // ✅ Absolute path — works on local & Render regardless of CWD
    apis: [join(__dirname, '../routes/*.js')],
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
