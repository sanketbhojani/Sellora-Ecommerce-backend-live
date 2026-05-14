import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Create transporter once (reusable) ───────────────────────
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',   // ✅ Explicit host instead of service:'gmail'
        port: 587,                 // ✅ TLS port (more reliable on cloud servers)
        secure: false,             // false for port 587 (STARTTLS)
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // ← Must be App Password, NOT Gmail password
        },
        // ✅ Prevents timeout issues on Render's network
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
};

// ─── Send OTP Email ───────────────────────────────────────────
const sendOTPEmail = async ({ name, email, otp, role }) => {
    try {
        const transporter = createTransporter();

        // ✅ Verify SMTP connection before sending (helps debug env var issues)
        await transporter.verify();

        const templatePath = path.join(__dirname, '../views/emails/otpEmail.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp, role });

        await transporter.sendMail({
            from: `"Sellora" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'OTP Verification Code',
            html,
        });

        console.log(`[Email] OTP sent successfully to ${email}`);
        return { success: true };

    } catch (error) {
        // ✅ Detailed error logging to debug on Render
        console.error('[Email] sendOTPEmail failed:', {
            message: error.message,
            code: error.code,        // e.g. EAUTH = wrong credentials
            command: error.command,  // e.g. AUTH = auth step failed
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
        await transporter.verify();

        const templatePath = path.join(__dirname, '../views/emails/resetPasswordEmail.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp, role });

        await transporter.sendMail({
            from: `"Sellora" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Code',
            html,
        });

        console.log(`[Email] Reset email sent successfully to ${email}`);
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