const axios = require('axios');
console.time('request');
axios.get('https://sellora-ecommerce-backend-live.onrender.com/api/auth/getMe', { timeout: 10000 })
  .then(res => { console.timeEnd('request'); console.log("SUCCESS:", res.status); })
  .catch(err => { console.timeEnd('request'); console.log("ERROR:", err.response ? err.response.status : err.message); });
