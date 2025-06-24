const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const db = require('./db');
const devicesRouter = require('./routes/devices');

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'IoT Device Management API'
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/devices', devicesRouter);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get API information
 *     description: Returns basic information about the API and available endpoints
 *     tags: [API Info]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIInfo'
 */
app.get('/', (req, res) => {
  res.json({
    message: 'IoT Device Management API',
    version: '1.0.0',
    documentation: 'Visit /api-docs for interactive API documentation',
    endpoints: {
      'GET /': 'API information',
      'GET /api-docs': 'Interactive API documentation (Swagger UI)',
      'GET /devices': 'List all devices',
      'POST /devices': 'Register new device',
      'GET /devices/:id': 'Get device details',
      'PUT /devices/:id': 'Update device',
      'DELETE /devices/:id': 'Delete device'
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

async function startServer() {
  try {
    await db.init();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 IoT Device Management API is running on http://localhost:${PORT}`);
      console.log('📚 Available endpoints:');
      console.log('  GET    /              - API information');
      console.log('  GET    /devices       - List all devices');
      console.log('  POST   /devices       - Register new device');
      console.log('  GET    /devices/:id   - Get device details');
      console.log('  PUT    /devices/:id   - Update device');
      console.log('  DELETE /devices/:id   - Delete device');
    });

    process.on('SIGINT', () => {
      console.log('\nShutting down server...');
      server.close(() => {
        console.log('Server closed');
        db.close();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();