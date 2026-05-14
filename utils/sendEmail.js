import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,          // ✅ 587 works on Render, 465 is often blocked
        secure: false,      // ✅ false for port 587 (STARTTLS)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // must be Gmail App Password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// ─── Send OTP Email ───────────────────────────────────────────
const sendOTPEmail = async ({ name, email, otp, role }) => {
    try {
        const transporter = createTransporter();
        // ❌ Removed transporter.verify() — crashes server on Render

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
            command: error.command,
            EMAIL_USER: process.env.EMAIL_USER ? '✅ set' : '❌ missing',
            EMAIL_PASS: process.env.EMAIL_PASS ? '✅ set' : '❌ missing',
        });
        return { success: false, error: error.message };
    }
};

// ─── Send Password Reset Email ────────────────────────────────
const sendPasswordResetEmail = async ({ name, email, otp, role }) => {
    try {
        const transporter = createTransporter();
        // ❌ Removed transporter.verify()

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
            command: error.command,
            EMAIL_USER: process.env.EMAIL_USER ? '✅ set' : '❌ missing',
            EMAIL_PASS: process.env.EMAIL_PASS ? '✅ set' : '❌ missing',
        });
        return { success: false, error: error.message };
    }
};

export { sendOTPEmail, sendPasswordResetEmail };