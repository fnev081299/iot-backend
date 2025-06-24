const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Database queries constants
 */
const QUERIES = {
  CREATE_DEVICES_TABLE: `
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'offline',
      config TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
  INSERT_DEVICE: `
    INSERT INTO devices (name, type, status, config, updated_at) 
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `,
  SELECT_ALL_DEVICES: 'SELECT * FROM devices ORDER BY created_at DESC',
  SELECT_DEVICE_BY_ID: 'SELECT * FROM devices WHERE id = ?',
  UPDATE_DEVICE: 'UPDATE devices SET {updates} WHERE id = ?',
  DELETE_DEVICE: 'DELETE FROM devices WHERE id = ?',
  COUNT_DEVICES: 'SELECT COUNT(*) as count FROM devices'
};

/**
 * Default device status values
 */
const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  ON: 'on',
  OFF: 'off'
};

/**
 * Sample devices for initial seeding
 */
const SAMPLE_DEVICES = [
  {
    name: 'Living Room Light',
    type: 'light',
    status: DEVICE_STATUS.ON,
    config: JSON.stringify({ brightness: 75, color: 'warm_white' })
  },
  {
    name: 'Smart Thermostat',
    type: 'thermostat',
    status: DEVICE_STATUS.ON,
    config: JSON.stringify({ temperature: 22, mode: 'heat' })
  },
  {
    name: 'Security Camera',
    type: 'camera',
    status: DEVICE_STATUS.ONLINE,
    config: JSON.stringify({ resolution: '1080p', night_vision: true })
  }
];

/**
 * Database management class for IoT devices
 * Implements singleton pattern for database connection management
 */
class Database {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  /**
   * Initialize database connection and setup tables
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      console.log('Database already initialized');
      return;
    }

    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'devices.db');
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this._setupDatabase()
            .then(() => {
              this.isInitialized = true;
              resolve();
            })
            .catch(reject);
        }
      });
    });
  }

  /**
   * Setup database tables and initial data
   * @private
   * @returns {Promise<void>}
   */
  async _setupDatabase() {
    await this.createTables();
    await this.seedSampleData();
  }

  /**
   * Create necessary database tables
   * @private
   * @returns {Promise<void>}
   */
  async createTables() {
    return new Promise((resolve, reject) => {
      this.db.run(QUERIES.CREATE_DEVICES_TABLE, (err) => {
        if (err) {
          console.error('Error creating devices table:', err.message);
          reject(err);
        } else {
          console.log('Devices table created or already exists');
          resolve();
        }
      });
    });
  }

  /**
   * Seed database with sample data if empty
   * @private
   * @returns {Promise<void>}
   */
  async seedSampleData() {
    return new Promise((resolve, reject) => {
      this.db.get(QUERIES.COUNT_DEVICES, (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          this._insertSampleDevices()
            .then(() => resolve())
            .catch(reject);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Insert sample devices into database
   * @private
   * @returns {Promise<void>}
   */
  async _insertSampleDevices() {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(QUERIES.INSERT_DEVICE);

      SAMPLE_DEVICES.forEach(device => {
        stmt.run([device.name, device.type, device.status, device.config]);
      });

      stmt.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Sample devices added to database');
          resolve();
        }
      });
    });
  }

  // ============================================================================
  // DEVICE CRUD OPERATIONS
  // ============================================================================

  /**
   * Create a new device
   * @param {Object} deviceData - Device data object
   * @param {string} deviceData.name - Device name
   * @param {string} deviceData.type - Device type
   * @param {string} [deviceData.status='offline'] - Device status
   * @param {string|Object} [deviceData.config='{}'] - Device configuration
   * @returns {Promise<Object>} Created device object
   */
  async createDevice(deviceData) {
    this._validateDeviceData(deviceData);
    
    return new Promise((resolve, reject) => {
      const { name, type, status = DEVICE_STATUS.OFFLINE, config = '{}' } = deviceData;
      const configString = this._ensureStringConfig(config);
      
      const stmt = this.db.prepare(QUERIES.INSERT_DEVICE);

      stmt.run([name, type, status, configString], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            name,
            type,
            status,
            config: JSON.parse(configString)
          });
        }
      });

      stmt.finalize();
    });
  }

  /**
   * Get all devices from database
   * @returns {Promise<Array>} Array of device objects
   */
  async getAllDevices() {
    return new Promise((resolve, reject) => {
      this.db.all(QUERIES.SELECT_ALL_DEVICES, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const devices = rows.map(row => this._formatDeviceRow(row));
          resolve(devices);
        }
      });
    });
  }

  /**
   * Get device by ID
   * @param {number} id - Device ID
   * @returns {Promise<Object|null>} Device object or null if not found
   */
  async getDeviceById(id) {
    this._validateId(id);
    
    return new Promise((resolve, reject) => {
      this.db.get(QUERIES.SELECT_DEVICE_BY_ID, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve(this._formatDeviceRow(row));
        }
      });
    });
  }

  /**
   * Update device by ID
   * @param {number} id - Device ID
   * @param {Object} updateData - Data to update
   * @param {string} [updateData.status] - New status
   * @param {string|Object} [updateData.config] - New configuration
   * @returns {Promise<boolean|null>} True if updated, null if device not found
   */
  async updateDevice(id, updateData) {
    this._validateId(id);
    this._validateUpdateData(updateData);
    
    return new Promise((resolve, reject) => {
      const { status, config } = updateData;
      const updates = [];
      const values = [];

      if (status !== undefined) {
        updates.push('status = ?');
        values.push(status);
      }

      if (config !== undefined) {
        updates.push('config = ?');
        values.push(this._ensureStringConfig(config));
      }

      if (updates.length === 0) {
        reject(new Error('No valid fields to update'));
        return;
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const query = QUERIES.UPDATE_DEVICE.replace('{updates}', updates.join(', '));

      this.db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Delete device by ID
   * @param {number} id - Device ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteDevice(id) {
    this._validateId(id);
    
    return new Promise((resolve, reject) => {
      this.db.run(QUERIES.DELETE_DEVICE, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Format database row into device object
   * @private
   * @param {Object} row - Database row
   * @returns {Object} Formatted device object
   */
  _formatDeviceRow(row) {
    return {
      ...row,
      config: JSON.parse(row.config || '{}')
    };
  }

  /**
   * Ensure config is a string
   * @private
   * @param {string|Object} config - Configuration data
   * @returns {string} String representation of config
   */
  _ensureStringConfig(config) {
    return typeof config === 'string' ? config : JSON.stringify(config);
  }

  /**
   * Validate device data for creation
   * @private
   * @param {Object} deviceData - Device data to validate
   * @throws {Error} If validation fails
   */
  _validateDeviceData(deviceData) {
    if (!deviceData || typeof deviceData !== 'object') {
      throw new Error('Device data must be an object');
    }
    
    if (!deviceData.name || typeof deviceData.name !== 'string') {
      throw new Error('Device name is required and must be a string');
    }
    
    if (!deviceData.type || typeof deviceData.type !== 'string') {
      throw new Error('Device type is required and must be a string');
    }
  }

  /**
   * Validate device ID
   * @private
   * @param {*} id - ID to validate
   * @throws {Error} If validation fails
   */
  _validateId(id) {
    if (!id || (!Number.isInteger(Number(id)) && !Number.isInteger(id))) {
      throw new Error('Valid device ID is required');
    }
  }

  /**
   * Validate update data
   * @private
   * @param {Object} updateData - Update data to validate
   * @throws {Error} If validation fails
   */
  _validateUpdateData(updateData) {
    if (!updateData || typeof updateData !== 'object') {
      throw new Error('Update data must be an object');
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('Update data cannot be empty');
    }
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed');
          }
          this.isInitialized = false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get database connection status
   * @returns {boolean} True if database is initialized
   */
  isConnected() {
    return this.isInitialized && this.db !== null;
  }
}

module.exports = new Database();