const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(__dirname, 'devices.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  async createTables() {
    return new Promise((resolve, reject) => {
      const createDevicesTable = `
        CREATE TABLE IF NOT EXISTS devices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'offline',
          config TEXT DEFAULT '{}',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createDevicesTable, (err) => {
        if (err) {
          console.error('Error creating devices table:', err.message);
          reject(err);
        } else {
          console.log('Devices table created or already exists');
          this.seedSampleData()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  async seedSampleData() {
    return new Promise((resolve, reject) => {
      // Check if table has data
      this.db.get('SELECT COUNT(*) as count FROM devices', (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row.count === 0) {
          const sampleDevices = [
            {
              name: 'Living Room Light',
              type: 'light',
              status: 'on',
              config: JSON.stringify({ brightness: 75, color: 'warm_white' })
            },
            {
              name: 'Smart Thermostat',
              type: 'thermostat',
              status: 'on',
              config: JSON.stringify({ temperature: 22, mode: 'heat' })
            },
            {
              name: 'Security Camera',
              type: 'camera',
              status: 'online',
              config: JSON.stringify({ resolution: '1080p', night_vision: true })
            }
          ];

          const stmt = this.db.prepare(`
            INSERT INTO devices (name, type, status, config) 
            VALUES (?, ?, ?, ?)
          `);

          sampleDevices.forEach(device => {
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
        } else {
          resolve();
        }
      });
    });
  }

  async createDevice(deviceData) {
    return new Promise((resolve, reject) => {
      const { name, type, status = 'offline', config = '{}' } = deviceData;
      const stmt = this.db.prepare(`
        INSERT INTO devices (name, type, status, config, updated_at) 
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run([name, type, status, config], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            name,
            type,
            status,
            config: JSON.parse(config)
          });
        }
      });

      stmt.finalize();
    });
  }

  async getAllDevices() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM devices ORDER BY created_at DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const devices = rows.map(row => ({
            ...row,
            config: JSON.parse(row.config || '{}')
          }));
          resolve(devices);
        }
      });
    });
  }

  async getDeviceById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM devices WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            ...row,
            config: JSON.parse(row.config || '{}')
          });
        }
      });
    });
  }

  async updateDevice(id, updateData) {
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
        values.push(typeof config === 'string' ? config : JSON.stringify(config));
      }

      if (updates.length === 0) {
        reject(new Error('No valid fields to update'));
        return;
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      const query = `UPDATE devices SET ${updates.join(', ')} WHERE id = ?`;

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

  async deleteDevice(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM devices WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = new Database();