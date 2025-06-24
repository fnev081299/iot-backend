const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAPI() {
  console.log('Testing IoT Device Management API...\n');

  try {
    console.log('1. Testing GET / (API Info)');
    const apiInfo = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`Status: ${apiInfo.statusCode}`);
    console.log(`Response: ${JSON.stringify(apiInfo.body, null, 2)}\n`);

    console.log('2. Testing GET /devices (List all devices)');
    const allDevices = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/devices',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`Status: ${allDevices.statusCode}`);
    console.log(`Found ${allDevices.body.count} devices\n`);

    console.log('3. Testing GET /devices/1 (Get specific device)');
    const deviceById = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/devices/1',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`Status: ${deviceById.statusCode}`);
    console.log(`Device: ${deviceById.body.device ? deviceById.body.device.name : 'Not found'}\n`);

    console.log('4. Testing POST /devices (Create new device)');
    const newDeviceData = {
      name: 'Smart Door Lock',
      type: 'lock',
      status: 'online',
      config: {
        locked: true,
        auto_lock: 300
      }
    };

    const createDevice = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/devices',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, newDeviceData);
    console.log(`   Status: ${createDevice.statusCode}`);
    console.log(`   Created device ID: ${createDevice.body.device ? createDevice.body.device.id : 'Failed'}\n`);

    if (createDevice.body.device && createDevice.body.device.id) {
      const deviceId = createDevice.body.device.id;
      console.log(`5. Testing PUT /devices/${deviceId} (Update device)`);
      const updateData = {
        status: 'offline',
        config: {
          locked: false,
          auto_lock: 600
        }
      };

      const updateDevice = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: `/devices/${deviceId}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      }, updateData);
      console.log(`Status: ${updateDevice.statusCode}`);
      console.log(`Updated device status: ${updateDevice.body.device ? updateDevice.body.device.status : 'Failed'}\n`);

      console.log(`6. Testing DELETE /devices/${deviceId} (Delete device)`);
      const deleteDevice = await makeRequest({
        hostname: 'localhost',
        port: 3000,
        path: `/devices/${deviceId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(`Status: ${deleteDevice.statusCode}`);
      console.log(`Deleted: ${deleteDevice.body.message || 'Failed'}\n`);
    }

    console.log('7. Testing error handling (GET /devices/999)');
    const notFound = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/devices/999',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`Status: ${notFound.statusCode}`);
    console.log(`Error: ${notFound.body.error || 'No error'}\n`);

    console.log('All API tests completed successfully!');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAPI();