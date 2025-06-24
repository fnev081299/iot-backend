const express = require('express');
const Joi = require('joi');
const db = require('../db');

const router = express.Router();

const deviceSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('light', 'thermostat', 'camera', 'sensor', 'switch', 'speaker', 'lock', 'other').required(),
  status: Joi.string().valid('on', 'off', 'online', 'offline', 'idle').optional(),
  config: Joi.object().optional()
});

const updateDeviceSchema = Joi.object({
  status: Joi.string().valid('on', 'off', 'online', 'offline', 'idle').optional(),
  config: Joi.object().optional()
}).min(1); 

/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: IoT device management endpoints
 */

/**
 * @swagger
 * /devices:
 *   post:
 *     summary: Register a new IoT device
 *     description: Creates a new device with the specified name, type, status, and configuration
 *     tags: [Devices]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceInput'
 *           examples:
 *             light:
 *               summary: Smart Light
 *               value:
 *                 name: "Living Room Light"
 *                 type: "light"
 *                 status: "on"
 *                 config:
 *                   brightness: 75
 *                   color: "warm_white"
 *             thermostat:
 *               summary: Smart Thermostat
 *               value:
 *                 name: "Bedroom Thermostat"
 *                 type: "thermostat"
 *                 status: "on"
 *                 config:
 *                   temperature: 20
 *                   mode: "heat"
 *                   schedule_enabled: true
 *             camera:
 *               summary: Security Camera
 *               value:
 *                 name: "Front Door Camera"
 *                 type: "camera"
 *                 status: "online"
 *                 config:
 *                   resolution: "1080p"
 *                   night_vision: true
 *                   motion_detection: true
 *     responses:
 *       201:
 *         description: Device registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Device registered successfully"
 *                 device:
 *                   $ref: '#/components/schemas/Device'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res) => {
  try {
    const { error, value } = deviceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const deviceData = {
      name: value.name,
      type: value.type,
      status: value.status || 'offline',
      config: JSON.stringify(value.config || {})
    };

    const newDevice = await db.createDevice(deviceData);

    res.status(201).json({
      message: 'Device registered successfully',
      device: newDevice
    });

  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register device'
    });
  }
});

/**
 * @swagger
 * /devices:
 *   get:
 *     summary: Get all devices
 *     description: Retrieves a summary of all registered devices (without full configuration details)
 *     tags: [Devices]
 *     responses:
 *       200:
 *         description: List of devices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Living Room Light"
 *                   type:
 *                     type: string
 *                     example: "light"
 *                   status:
 *                     type: string
 *                     example: "on"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-06-24T10:30:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  try {
    const devices = await db.getAllDevices();
    
    const devicesSummary = devices.map(device => ({
      id: device.id,
      name: device.name,
      type: device.type,
      status: device.status,
      created_at: device.created_at,
      updated_at: device.updated_at
    }));

    res.json({
      message: 'Devices retrieved successfully',
      count: devicesSummary.length,
      devices: devicesSummary
    });

  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve devices'
    });
  }
});

/**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Get device details
 *     description: Retrieves full details of a specific device including configuration
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the device to retrieve
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Device details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Device'
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);

    // Validate ID is a number
    if (isNaN(deviceId) || deviceId <= 0) {
      return res.status(400).json({
        error: 'Invalid device ID',
        message: 'Device ID must be a positive integer'
      });
    }

    const device = await db.getDeviceById(deviceId);

    if (!device) {
      return res.status(404).json({
        error: 'Device not found',
        message: `Device with ID ${deviceId} does not exist`
      });
    }

    res.json({
      message: 'Device retrieved successfully',
      device: device
    });

  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve device'
    });
  }
});

/**
 * @swagger
 * /devices/{id}:
 *   put:
 *     summary: Update device
 *     description: Updates device status and/or configuration
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the device to update
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceUpdate'
 *           examples:
 *             status_update:
 *               summary: Update Status Only
 *               value:
 *                 status: "off"
 *             config_update:
 *               summary: Update Config Only
 *               value:
 *                 config:
 *                   brightness: 50
 *                   color: "cool_white"
 *             full_update:
 *               summary: Update Both Status and Config
 *               value:
 *                 status: "on"
 *                 config:
 *                   brightness: 80
 *                   color: "daylight"
 *     responses:
 *       200:
 *         description: Device updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Device updated successfully"
 *                 device:
 *                   $ref: '#/components/schemas/Device'
 *       400:
 *         description: Bad request (validation error or invalid ID)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);

    if (isNaN(deviceId) || deviceId <= 0) {
      return res.status(400).json({
        error: 'Invalid device ID',
        message: 'Device ID must be a positive integer'
      });
    }

    const { error, value } = updateDeviceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details[0].message
      });
    }

    const existingDevice = await db.getDeviceById(deviceId);
    if (!existingDevice) {
      return res.status(404).json({
        error: 'Device not found',
        message: `Device with ID ${deviceId} does not exist`
      });
    }

    const updateResult = await db.updateDevice(deviceId, value);
    
    if (!updateResult) {
      return res.status(404).json({
        error: 'Device not found',
        message: `Device with ID ${deviceId} does not exist`
      });
    }

    const updatedDevice = await db.getDeviceById(deviceId);

    res.json({
      message: 'Device updated successfully',
      device: updatedDevice
    });

  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update device'
    });
  }
});

/**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Delete device
 *     description: Removes a device from the system permanently
 *     tags: [Devices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the device to delete
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Device deleted successfully"
 *       400:
 *         description: Invalid device ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', async (req, res) => {
  try {
    const deviceId = parseInt(req.params.id);

    if (isNaN(deviceId) || deviceId <= 0) {
      return res.status(400).json({
        error: 'Invalid device ID',
        message: 'Device ID must be a positive integer'
      });
    }

    const existingDevice = await db.getDeviceById(deviceId);
    if (!existingDevice) {
      return res.status(404).json({
        error: 'Device not found',
        message: `Device with ID ${deviceId} does not exist`
      });
    }

    const deleteResult = await db.deleteDevice(deviceId);

    if (deleteResult) {
      res.json({
        message: 'Device deleted successfully',
        deleted_device: {
          id: existingDevice.id,
          name: existingDevice.name,
          type: existingDevice.type
        }
      });
    } else {
      res.status(404).json({
        error: 'Device not found',
        message: `Device with ID ${deviceId} does not exist`
      });
    }

  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete device'
    });
  }
});

module.exports = router;