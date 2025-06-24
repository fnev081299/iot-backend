# IoT Device Management API

A RESTful API for managing IoT devices in a smart home environment, built with Node.js, Express, and SQLite.

## Features

- **Device Registration**: Register new IoT devices with name, type, status, and configuration
- **Device Listing**: Get a summary of all registered devices
- **Device Details**: Retrieve full details of a specific device
- **Device Updates**: Update device status and configuration
- **Device Deletion**: Remove devices from the system
- **Input Validation**: Comprehensive validation using Joi
- **Error Handling**: Proper error responses with meaningful messages
- **Sample Data**: Automatically seeds the database with example devices

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database for persistent storage
- **Joi** - Input validation
- **Nodemon** - Development server with auto-restart

## Project Structure

```
iot-backend/
├── server.js           # Main server file
├── db.js              # Database operations and models
├── routes/
│   └── devices.js     # Device API routes
├── package.json       # Dependencies and scripts
├── devices.db         # SQLite database (created automatically)
└── README.md          # This file
```

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd iot-backend
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install
   ```

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

## API Endpoints

### 1. Get API Information
- **GET** `/`
- Returns API information and available endpoints

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

## Device Types

The API supports the following device types:
- `light` - Smart lights
- `thermostat` - Temperature control
- `camera` - Security cameras
- `sensor` - Various sensors
- `switch` - Smart switches
- `speaker` - Smart speakers
- `lock` - Smart locks
- `other` - Other IoT devices

## Device Status Values

- `on` - Device is powered on
- `off` - Device is powered off
- `online` - Device is connected
- `offline` - Device is disconnected
- `idle` - Device is idle/standby

## Sample Requests

### Register a new smart thermostat:
```bash
curl -X POST http://localhost:3000/devices \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bedroom Thermostat",
    "type": "thermostat",
    "status": "on",
    "config": {
      "temperature": 20,
      "mode": "heat",
      "schedule_enabled": true
    }
  }'
```

### Get all devices:
```bash
curl http://localhost:3000/devices
```

### Update device status:
```bash
curl -X PUT http://localhost:3000/devices/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "off"
  }'
```

### Delete a device:
```bash
curl -X DELETE http://localhost:3000/devices/1
```

## Error Responses

The API returns structured error responses:

```json
{
  "error": "Validation failed",
  "details": "\"name\" is required"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Running in Development Mode

Use nodemon for automatic server restarts during development:
```bash
npm run dev
```

### Database

The SQLite database (`devices.db`) is created automatically when the server starts. Sample devices are added if the database is empty.

To reset the database, simply delete the `devices.db` file and restart the server.

### Adding New Features

1. **Database changes**: Modify the `createTables()` method in `db.js`
2. **New endpoints**: Add routes to `routes/devices.js`
3. **Validation**: Update Joi schemas for new fields
4. **Testing**: Test endpoints with curl or Postman

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, set a different port:
```bash
PORT=3001 npm start
```

### Database Issues
If you encounter database errors:
1. Delete `devices.db` file
2. Restart the server
3. The database will be recreated automatically

### Missing Dependencies
If you get module not found errors:
```bash
npm install
```

## Security Considerations

This is a development API. For production use, consider adding:
- Authentication and authorization
- Rate limiting
- Input sanitization
- HTTPS encryption
- Database connection pooling
- Logging and monitoring

## License

This project is licensed under the ISC License.