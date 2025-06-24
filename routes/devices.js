const express = require('express');
const Joi = require('joi');
const db = require('../db');

const router = express.Router();

// Validation schemas
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