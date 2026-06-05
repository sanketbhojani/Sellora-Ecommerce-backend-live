const axios = require('axios');
axios.post('http://localhost:5000/api/auth/register/registerCustomer', {
  name: "test user local",
  email: "testlocal123@gmail.com",
  password: "password123",
  confirmPassword: "password123",
  phone: "1234567890"
}).then(res => console.log("SUCCESS:", res.data))
  .catch(err => console.log("ERROR:", err.response ? err.response.data : err.message));
