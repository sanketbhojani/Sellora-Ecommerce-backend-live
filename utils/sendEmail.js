import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',   // ✅ explicit host instead of service
    port: 465,
    secure: true,
    family: 4,                // ✅ force IPv4 — fixes ENETUNREACH on Render
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 3,
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
        console.error('[Email] sendOTPEmail failed:', error.message);
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
        console.error('[Email] sendPasswordResetEmail failed:', error.message);
        return { success: false, error: error.message };
    }
};

export { sendOTPEmail, sendPasswordResetEmail };