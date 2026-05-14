import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail', // ✅ Using service shortcut for better internal routing
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // must be Gmail App Password
        },
        tls: {
            rejectUnauthorized: false
        },
        family: 4 // ✅ Force IPv4 to resolve "ENETUNREACH" issues on Render
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