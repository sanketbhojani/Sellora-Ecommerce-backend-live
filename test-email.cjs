const axios = require('axios');
axios.get('https://sellora-ecommerce-backend-live.onrender.com/test-email', { timeout: 10000 })
  .then(res => console.log("SUCCESS:", res.data))
  .catch(err => console.log("ERROR:", err.response ? err.response.data : err.message));
