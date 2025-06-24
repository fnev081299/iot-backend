# IoT Device Management API

A RESTful API for managing IoT devices in a smart home environment, built with Node.js, Express, and SQLite.

## Features

- **Device Registration**: Register new IoT devices with name, type, status, and configuration
- **Device Listing**: Get a summary of all registered devices
- **Device Details**: Retrieve full details of a specific device
- **Device Updates**: Update device status and configuration
- **Device Deletion**: Remove devices from the system
- **Input Validation**: Comprehensive validation using Joi
- **Error Handling**: For assisting users
- **Sample Data**: Automatically seeds the database with example devices

## Project Assumptions
### Task Overview
**Objective**: Build a backend system acting as the central hub for managing IoT devices in a smart home environment, with a focus on RESTful APIs, state management, and IoT device control.

### Key Assumptions Made

#### 1. **Device Data Structure**
- **Device Properties**: Each device has `name`, `type`, `status`, and `config` properties
- **Device Types**: Assumed common IoT device categories (light, thermostat, camera, sensor, switch, speaker, lock)
- **Status Values**: Standardized status options (on/off, online/offline, idle) applicable across device types
- **Configuration**: Flexible JSON object to accommodate different device-specific settings

#### 2. **Data Storage Approach**
- **SQLite Database**: Chosen for simplicity and portability (no external database setup required)
- **Persistent Storage**: Data persists between server restarts (not in-memory only)
- **Auto-seeding**: Database automatically populates with sample data for immediate testing
- **Schema Design**: Single `devices` table with JSON config field for flexibility

#### 3. **API Design Decisions**
- **RESTful Architecture**: Standard HTTP methods (GET, POST, PUT, DELETE) following REST conventions
- **JSON Communication**: All request/response data in JSON format
- **Comprehensive Endpoints**: Full CRUD operations as specified in requirements
- **Input Validation**: Joi validation library for robust data validation
- **Error Handling**: Standardized error responses with appropriate HTTP status codes

#### 4. **Technology Stack Choices**
- **Node.js + Express**: Chosen for rapid development and excellent REST API support
- **Swagger/OpenAPI**: Interactive documentation for easy testing and demonstration
- **Joi Validation**: Industry-standard validation library for input sanitization
- **Nodemon**: Development convenience for auto-restart during development

#### 5. **Smart Home Context**
- **Device Scenarios**: Realistic IoT device configurations (brightness for lights, temperature for thermostats)
- **Home Environment**: Assumed typical smart home setup with multiple rooms and device types
- **Device Naming**: Human-readable names with location context (e.g., "Living Room Light")
- **Configuration Examples**: Practical settings that real IoT devices would have

#### 6. **Development & Testing**
- **No Authentication**: Simplified for demonstration (no API keys or user management)
- **Local Development**: Designed to run locally without external dependencies
- **Testing Tools**: Multiple testing options (Swagger UI, curl, Postman) for different preferences
- **Documentation**: Comprehensive README with examples for easy evaluation

#### 7. **Production Considerations**
- **Error Handling**: Robust error responses for invalid inputs and edge cases
- **Data Validation**: Server-side validation to prevent invalid device states
- **HTTP Standards**: Proper status codes and REST conventions
- **Code Structure**: Modular design with separated concerns (routes, database, config)

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database for persistent storage
- **Joi** - Input validation
- **Swagger UI** - Interactive API documentation
- **Nodemon** - Development server with auto-restart

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd iot-backend
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install
   ```
   
   Required dependencies:
   - `express` - Web framework
   - `joi` - Input validation
   - `sqlite3` - Database driver
   - `swagger-jsdoc` - Swagger documentation generator
   - `swagger-ui-express` - Swagger UI middleware
   - `nodemon` - Development server (dev dependency)

3. **Start the server**

   **Development mode** (with auto-restart):
   ```bash
   npm run dev
   ```

   **Production mode**:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:3000`

## Quick Start

1. **Access the API**: `http://localhost:3000`
2. **View Interactive Documentation (Swagger UI)**: `http://localhost:3000/api-docs`
3. **Test with sample data**: The database is automatically seeded with example devices

## Database Schema

The SQLite database contains a `devices` table with the following structure:

| Column     | Type    | Description                           |
|------------|---------|---------------------------------------|
| id         | INTEGER | Primary key (auto-increment)         |
| name       | TEXT    | Device name                          |
| type       | TEXT    | Device type (light, thermostat, etc.) |
| status     | TEXT    | Device status (on, off, online, etc.) |
| config     | TEXT    | JSON configuration object            |
| created_at | DATETIME| Creation timestamp                   |
| updated_at | DATETIME| Last update timestamp                |

## API Documentation

### Interactive Documentation (Swagger UI)

The API includes interactive documentation powered by Swagger UI:

**🔗 http://localhost:3000/api-docs**

Features:
- **Live Testing**: Execute API calls directly from the browser
- **Request/Response Examples**: Pre-filled examples for all endpoints
- **Schema Documentation**: Detailed data models and validation rules
- **Multiple Examples**: Different device types with realistic configurations

### Quick API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information and endpoints |
| GET | `/api-docs` | Interactive Swagger documentation |
| POST | `/devices` | Register a new device |
| GET | `/devices` | List all devices (summary) |
| GET | `/devices/:id` | Get full device details |
| PUT | `/devices/:id` | Update device status/config |
| DELETE | `/devices/:id` | Remove device |

## API Endpoints (Detailed)

### 1. Get API Information
- **GET** `/`
- Returns API information and available endpoints
- **Response Example:**
  ```json
  {
    "message": "IoT Device Management API",
    "version": "1.0.0",
    "documentation": "Visit /api-docs for interactive API documentation",
    "endpoints": { ... }
  }
  ```

### 2. Register New Device
- **POST** `/devices`
- **Body:**
  ```json
  {
    "name": "Living Room Light",
    "type": "light",
    "status": "on",
    "config": {
      "brightness": 75,
      "color": "warm_white"
    }
  }
  ```
- **Response:** Created device with assigned ID

### 3. List All Devices
- **GET** `/devices`
- Returns summary of all devices (without full config details)

### 4. Get Device Details
- **GET** `/devices/:id`
- Returns full device details including configuration

### 5. Update Device
- **PUT** `/devices/:id`
- **Body:**
  ```json
  {
    "status": "off",
    "config": {
      "brightness": 50,
      "color": "cool_white"
    }
  }
  ```
- Updates device status and/or configuration

### 6. Delete Device
- **DELETE** `/devices/:id`
- Removes device from the system

## Configuration Examples *(Based on Assumptions)*

### Device Type Examples 

**Smart Light:**
```json
{
  "name": "Living Room Light",
  "type": "light",
  "status": "on",
  "config": {
    "brightness": 75,
    "color": "warm_white",
    "dimming": true
  }
}
```

**Smart Thermostat:**
```json
{
  "name": "Bedroom Thermostat",
  "type": "thermostat",
  "status": "on",
  "config": {
    "temperature": 22,
    "mode": "heat",
    "schedule_enabled": true,
    "target_temp": 20
  }
}
```

**Security Camera:**
```json
{
  "name": "Front Door Camera",
  "type": "camera",
  "status": "online",
  "config": {
    "resolution": "1080p",
    "night_vision": true,
    "motion_detection": true,
    "recording": false
  }
}
```

**Smart Sensor:**
```json
{
  "name": "Living Room Motion Sensor",
  "type": "sensor",
  "status": "online",
  "config": {
    "sensitivity": "medium",
    "detection_range": 5,
    "battery_level": 85
  }
}
```

## Testing

### Option 1: Swagger UI (Recommended)
1. Start the server: `npm run dev`
2. Open: `http://localhost:3000/api-docs`
3. Click "Try it out" on any endpoint
4. Fill in parameters and click "Execute"

### Option 2: Command Line (curl)

**Test API Status:**
```bash
curl http://localhost:3000/
```

**Register a Smart Light:**
```bash
curl -X POST http://localhost:3000/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Living Room Light",
    "type": "light",
    "status": "on",
    "config": {
      "brightness": 75,
      "color": "warm_white"
    }
  }'
```

**Get All Devices:**
```bash
curl http://localhost:3000/devices
```

**Update Device:**
```bash
curl -X PUT http://localhost:3000/devices/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "off"}'
```

### Option 3: Postman
1. Import the API using the OpenAPI specification: `http://localhost:3000/api-docs-json`
2. Or manually create requests using the endpoints listed above

## Reference (Assumptions Made)

### Supported Device Types
- `light` - Smart lights
- `thermostat` - Temperature control
- `camera` - Security cameras
- `sensor` - Various sensors (motion, temperature, etc.)
- `switch` - Smart switches
- `speaker` - Smart speakers
- `lock` - Smart locks
- `other` - Other IoT devices

### Device Status Values
- `on` - Device is powered on
- `off` - Device is powered off
- `online` - Device is connected to network
- `offline` - Device is disconnected
- `idle` - Device is in standby mode

### HTTP Status Codes
- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (validation errors, invalid ID)
- `404` - Not Found (device doesn't exist)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": "Validation failed",
  "details": "\"name\" is required"
}
```

## Development

### Development Workflow

1. **Start Development Server:**
   ```bash
   npm run dev
   ```
   - Auto-restarts on file changes
   - Logs all API requests to console

2. **Access Development Tools:**
   - API: `http://localhost:3000`
   - Documentation: `http://localhost:3000/api-docs`
   - Database: SQLite file at `./devices.db`

3. **Making Changes:**
   - Edit routes in `routes/devices.js`
   - Update database schema in `db.js`
   - Modify Swagger docs in `config/swagger.js`
   - Add tests in `tests/api-test.js`
   - Server restarts automatically with nodemon

### Database Management

**Automatic Setup:**
- SQLite database (`devices.db`) is created automatically on first run
- Sample devices are seeded if database is empty

**Reset Database:**
```bash
# Stop the server, then:
rm devices.db        # macOS/Linux
del devices.db       # Windows
npm run dev          # Restart - database will be recreated
```

**Manual Database Operations:**
```bash
# View database content (requires sqlite3 CLI)
sqlite3 devices.db ".tables"
sqlite3 devices.db "SELECT * FROM devices;"
```

### Extending the API

**Adding New Device Types:**
1. Update the enum in `routes/devices.js` (deviceSchema)
2. Update Swagger schema in `config/swagger.js`
3. Add examples to documentation

**Adding New Endpoints:**
1. Create route in `routes/devices.js`
2. Add validation schema using Joi
3. Add Swagger documentation comments
4. Test with Swagger UI and `tests/api-test.js`

**Modifying Database Schema:**
1. Update `createTables()` in `db.js`
2. Delete existing database file
3. Restart server to recreate with new schema

## Troubleshooting

### Common Issues

**Port 3000 Already in Use:**
```bash
# Use a different port
PORT=3001 npm run dev
```

**Module Not Found Errors:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json  # macOS/Linux
rmdir /s node_modules & del package-lock.json  # Windows
npm install
```

**Database Issues:**
```bash
# Reset database
npm run dev
```

**Swagger UI Not Loading:**
- Check server is running on correct port
- Verify `config/swagger.js` file exists
- Check browser console for JavaScript errors
- Try accessing: `http://localhost:3000/api-docs-json` (raw OpenAPI spec)

**API Endpoints Not Working:**
- Verify Content-Type header: `application/json`
- Check request body format (valid JSON)
- Review validation errors in API response
- Test with Swagger UI first before using curl/Postman

### Environment Variables
```bash
# .env file
PORT=3000
NODE_ENV=production
DATABASE_PATH=./devices.db
API_KEY_SECRET=your-secret-key
```

## Future Improvements

### Authentication & Security
- Add user authentication with JWT tokens
- Implement API key authentication for devices
- Add rate limiting to prevent API abuse
- Enable HTTPS for secure communication

### Enhanced Device Features
- Device grouping by rooms or zones
- Bulk operations (update multiple devices at once)
- Device scheduling and automation rules
- Support for device firmware updates

### Real-time Updates
- WebSocket support for live device status updates
- Push notifications for device state changes
- Real-time dashboard for monitoring all devices

### Database & Performance
- Migrate from SQLite to PostgreSQL for better scalability
- Add Redis caching for frequently accessed data
- Implement database backup and recovery
- Add connection pooling for better performance

### API Enhancements
- Add GraphQL endpoint for flexible queries
- Implement API versioning
- Add pagination for device listings
- Create comprehensive test suite

### Monitoring & Analytics
- Add logging and monitoring capabilities
- Device usage analytics and reports
- Health check endpoints
- Error tracking and alerting

### Integration Features
- MQTT support for IoT device communication
- Webhook support for third-party integrations
- Export/import device configurations
- Mobile app development

### User Experience
- Web-based admin dashboard
- Device configuration templates
- Advanced search and filtering
- Multi-language support

## Support

- **Documentation**: Visit `/api-docs` when server is running
- **Issues**: Check the troubleshooting section above
- **API Testing**: Use Swagger UI for interactive testing - `/api-docs`