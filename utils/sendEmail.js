import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Force Node.js to prioritize IPv4 (Fixes ENETUNREACH IPv6 issues on Render)
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Nodemailer Transporter ───────────────────────────────
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',   // explicit host
    port: 465,
    secure: true,
    family: 4,                // force IPv4
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 3,
    // Optional: increase timeouts for stability
    connectionTimeout: 10000,   // 10 seconds
    greetingTimeout: 5000,      // 5 seconds
    socketTimeout: 10000,       // 10 seconds
    debug: false,               // set true if you want verbose logs
});

// ─── Helper: Retry sendMail ───────────────────────────────
const sendWithRetry = async (mailOptions, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        try {
            return await transporter.sendMail(mailOptions);
        } catch (err) {
            if (i === retries) throw err; // no retries left
            console.warn(`[Email] Retry ${i + 1} after error: ${err.message}`);
            await new Promise(res => setTimeout(res, 1000)); // wait 1s
        }
    }
};

// ─── Send OTP Email ───────────────────────────────────────
const sendOTPEmail = async ({ name, email, otp, role }) => {
    try {
        const templatePath = path.join(__dirname, '../views/emails/otpEmail.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp, role });

        const info = await sendWithRetry({
            from: `"Sellora" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'OTP Verification Code',
            html,
        });

        console.log(`[Email] OTP sent to ${email} — messageId: ${info.messageId}`);
        return { success: true };

    } catch (error) {
        console.error('[Email] sendOTPEmail failed:', error); // full error
        return { success: false, error: error.message };
    }
};

// ─── Send Password Reset Email ────────────────────────────
const sendPasswordResetEmail = async ({ name, email, otp, role }) => {
    try {
        const templatePath = path.join(__dirname, '../views/emails/resetPasswordEmail.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp, role });

        const info = await sendWithRetry({
            from: `"Sellora" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Code',
            html,
        });

        console.log(`[Email] Reset email sent to ${email} — messageId: ${info.messageId}`);
        return { success: true };

    } catch (error) {
        console.error('[Email] sendPasswordResetEmail failed:', error); // full error
        return { success: false, error: error.message };
    }
};

export { sendOTPEmail, sendPasswordResetEmail };