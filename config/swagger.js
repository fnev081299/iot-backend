const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IoT Device Management API',
      version: '1.0.0',
      description: 'A RESTful API for managing IoT devices in a smart home environment',
      contact: {
        name: 'API Support',
        email: 'support@iot-api.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Device: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-generated unique identifier',
              example: 1
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Device name',
              example: 'Living Room Light'
            },
            type: {
              type: 'string',
              enum: ['light', 'thermostat', 'camera', 'sensor', 'switch', 'speaker', 'lock', 'other'],
              description: 'Type of IoT device',
              example: 'light'
            },
            status: {
              type: 'string',
              enum: ['on', 'off', 'online', 'offline', 'idle'],
              description: 'Current status of the device',
              example: 'on'
            },
            config: {
              type: 'object',
              description: 'Device-specific configuration object',
              example: {
                brightness: 75,
                color: 'warm_white'
              }
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2025-06-24T10:30:00.000Z'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2025-06-24T10:30:00.000Z'
            }
          }
        },
        DeviceInput: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Device name',
              example: 'Living Room Light'
            },
            type: {
              type: 'string',
              enum: ['light', 'thermostat', 'camera', 'sensor', 'switch', 'speaker', 'lock', 'other'],
              description: 'Type of IoT device',
              example: 'light'
            },
            status: {
              type: 'string',
              enum: ['on', 'off', 'online', 'offline', 'idle'],
              description: 'Initial status of the device',
              example: 'on'
            },
            config: {
              type: 'object',
              description: 'Device-specific configuration object',
              example: {
                brightness: 75,
                color: 'warm_white'
              }
            }
          }
        },
        DeviceUpdate: {
          type: 'object',
          minProperties: 1,
          properties: {
            status: {
              type: 'string',
              enum: ['on', 'off', 'online', 'offline', 'idle'],
              description: 'New status for the device',
              example: 'off'
            },
            config: {
              type: 'object',
              description: 'Updated configuration object',
              example: {
                brightness: 50,
                color: 'cool_white'
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type',
              example: 'Validation failed'
            },
            message: {
              type: 'string',
              description: 'Error message',
              example: 'Device not found'
            },
            details: {
              type: 'string',
              description: 'Detailed error information',
              example: '"name" is required'
            }
          }
        },
        APIInfo: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'IoT Device Management API'
            },
            version: {
              type: 'string',
              example: '1.0.0'
            },
            endpoints: {
              type: 'object',
              description: 'Available API endpoints'
            }
          }
        }
      }
    }
  },
  apis: ['./server.js', './routes/*.js'] // Path to the API files
};

const specs = swaggerJsdoc(options);
module.exports = specs;
