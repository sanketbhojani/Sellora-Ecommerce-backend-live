import { sendOTPEmail } from './utils/sendEmail.js';

async function testEmail() {
    console.log("Testing email...");
    const result = await sendOTPEmail({
        name: "Test User",
        email: "sanket1.webyug@gmail.com",
        otp: "123456",
        role: "Customer"
    });
    console.log("Result:", result);
}

testEmail();
