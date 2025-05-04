
const axios = require('axios');

async function testApiHealth() {
  try {
    console.log('Testing API health endpoint...');
    const response = await axios.get('http://0.0.0.0:5000/api/health');
    if (response.data.status === 'ok') {
      console.log('✅ API health check passed');
      return true;
    }
    console.log('❌ API health check failed');
    return false;
  } catch (error) {
    console.error('❌ API health check failed:', error.message);
    return false;
  }
}

testApiHealth();
