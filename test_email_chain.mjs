// Test that simulates the exact server-process email sending
// This mimics the import chain: index.js → authController → sendEmail.js
import env from 'dotenv';
env.config(); // This is what index.js does

// Now simulate what sendEmail.js does when imported as a module
import { sendOTPEmail } from './utils/sendEmail.js';

console.log('=== Simulating server-process email ===');
console.log('Testing sendOTPEmail as it runs inside the server...');

try {
    await sendOTPEmail({
        name: 'Sanket Test',
        email: process.env.EMAIL_USER, // send to self
        otp: '999888',
        role: 'Customer'
    });
    console.log('✅ sendOTPEmail completed without throwing');
} catch (err) {
    console.error('❌ sendOTPEmail threw:', err);
}
