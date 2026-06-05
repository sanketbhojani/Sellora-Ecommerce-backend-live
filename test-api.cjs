const axios = require('axios');
axios.post('https://sellora-ecommerce-backend-live.onrender.com/api/auth/register/registerCustomer', {
  name: "test user",
  email: "test1234567@gmail.com",
  password: "password123",
  confirmPassword: "password123",
  phone: "1234567890"
}).then(res => console.log("SUCCESS:", res.data))
  .catch(err => console.log("ERROR:", err.response ? err.response.data : err.message));
