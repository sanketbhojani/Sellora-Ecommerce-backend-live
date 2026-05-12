// Direct SMTP test to diagnose email issues
import env from 'dotenv';
env.config();

import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Email Diagnostic ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS set:', !!process.env.EMAIL_PASS);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Step 1: Verify SMTP connection
try {
    await transporter.verify();
    console.log('✅ SMTP connection OK');
} catch (err) {
    console.error('❌ SMTP FAILED:', err.message);
    process.exit(1);
}

// Step 2: Render EJS template
let htmlContent;
try {
    const templatePath = path.join(__dirname, 'views/emails/otpEmail.ejs');
    console.log('Template path:', templatePath);
    htmlContent = await ejs.renderFile(templatePath, {
        name: 'Test User',
        otp: '123456',
        role: 'Customer'
    });
    console.log('✅ EJS template rendered OK, length:', htmlContent.length);
} catch (err) {
    console.error('❌ EJS TEMPLATE FAILED:', err.message);
    console.error(err);
    process.exit(1);
}

// Step 3: Send actual email
try {
    const info = await transporter.sendMail({
        from: `"Sellora" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // send to self
        subject: '🛍️ TEST - Sellora OTP Verification',
        html: htmlContent,
    });
    console.log('✅ Email SENT! Message ID:', info.messageId);
    console.log('Accepted:', info.accepted);
    console.log('Rejected:', info.rejected);
} catch (err) {
    console.error('❌ SEND EMAIL FAILED:', err.message);
    console.error('Code:', err.code);
    console.error(err);
}
