import jwt from 'jsonwebtoken';
import 'dotenv/config';

console.log("ACCOUNT SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("API KEY:", process.env.TWILIO_API_KEY);
console.log("API SECRET:", process.env.TWILIO_API_SECRET);
console.log("APP SID:", process.env.TWILIO_TWIML_APP_SID);
