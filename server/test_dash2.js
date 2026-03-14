const axios = require('axios');
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    const token = loginRes.data.data.accessToken;
    const dashRes = await axios.get('http://localhost:5000/api/v1/reports/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("DASHBOARD DATA:", JSON.stringify(dashRes.data, null, 2));
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
}
test();
