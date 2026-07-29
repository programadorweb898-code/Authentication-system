import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentación',
      version: '1.0.0',
      description: 'Documentación de la API del sistema',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
  },
  // Rutas a escanear para encontrar JSDoc
  apis: ['./template/src/domains/**/*.routes.js', './template/domains/**/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
