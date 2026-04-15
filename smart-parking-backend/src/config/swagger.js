const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🅿️ Smart Parking Management System API',
      version: '1.0.0',
      description: 'API REST complète pour la gestion intelligente de parking',
      contact: {
        name: 'Smart Parking',
        email: 'contact@smartparking.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez votre token JWT: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Ahmed Benali' },
            email: { type: 'string', example: 'ahmed@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ParkingSpot: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            number: { type: 'string', example: 'A-01' },
            status: { type: 'string', enum: ['free', 'occupied', 'reserved'], example: 'free' },
            type: { type: 'string', enum: ['normal', 'vip', 'handicap'], example: 'normal' },
            floor: { type: 'string', example: 'RDC' },
          },
        },
        Reservation: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            spotId: { type: 'integer', example: 5 },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'completed', 'cancelled'], example: 'active' },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            type: { type: 'string', enum: ['monthly', 'annual'], example: 'monthly' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['active', 'expired', 'cancelled'] },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            amount: { type: 'number', example: 150.00 },
            method: { type: 'string', enum: ['card', 'cash', 'transfer'], example: 'card' },
            status: { type: 'string', enum: ['pending', 'completed', 'failed'], example: 'completed' },
            date: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Erreur de validation' },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Opération réussie' },
            data: { type: 'object' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
module.exports = specs;
