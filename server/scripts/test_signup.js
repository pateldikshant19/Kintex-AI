const http = require('http');

const data = JSON.stringify({
    name: "Connectivity Test",
    email: "conn_test_" + Date.now() + "@example.com",
    password: "password123",
    role: "player",
    sport: "Football"
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${body}`);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
