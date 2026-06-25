const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'ExhibitorHub Enterprise API',
      version: '1.0.0',
      description: 'API documentation for ExhibitorHub platform with RBAC',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development Server' }
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
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

module.exports = swaggerJsDoc(swaggerOptions);
