import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Single reusable transporter (not recreated on every call) ────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',   // ✅ use service instead of host/port — nodemailer handles it
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,  // must be App Password, not Gmail login password
    },
    pool: true,          // ✅ reuse connections — avoids timeout on Render
    maxConnections: 3,
    rateDelta: 20000,
    rateLimit: 5,
});

// ─── Send OTP Email ───────────────────────────────────────────
const sendOTPEmail = async ({ name, email, otp, role }) => {
    try {
        const templatePath = path.join(__dirname, '../views/emails/otpEmail.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp, role });

        const info = await transporter.sendMail({
            from: `"Sellora" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'OTP Verification Code',
            html,
        });

        console.log(`[Email] OTP sent to ${email} — messageId: ${info.messageId}`);
        return { success: true };

    } catch (error) {
        console.error('[Email] sendOTPEmail failed:', {
            message: error.message,
            code: error.code,
            EMAIL_USER: process.env.EMAIL_USER ? '✅ set' : '❌ missing',
            EMAIL_PASS: process.env.EMAIL_PASS ? '✅ set' : '❌ missing',
        });
        return { success: false, error: error.message };
    }
};

// ─── Send Password Reset Email ────────────────────────────────
const sendPasswordResetEmail = async ({ name, email, otp, role }) => {
    try {
        const templatePath = path.join(__dirname, '../views/emails/resetPasswordEmail.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp, role });

        const info = await transporter.sendMail({
            from: `"Sellora" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Code',
            html,
        });

        console.log(`[Email] Reset email sent to ${email} — messageId: ${info.messageId}`);
        return { success: true };

    } catch (error) {
        console.error('[Email] sendPasswordResetEmail failed:', {
            message: error.message,
            code: error.code,
            EMAIL_USER: process.env.EMAIL_USER ? '✅ set' : '❌ missing',
            EMAIL_PASS: process.env.EMAIL_PASS ? '✅ set' : '❌ missing',
        });
        return { success: false, error: error.message };
    }
};

export { sendOTPEmail, sendPasswordResetEmail };