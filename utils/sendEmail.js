import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Brevo SMTP (works on Render — Gmail/port 465/587 are blocked) ────────────
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.BREVO_HOST,         // smtp-relay.brevo.com
        port: Number(process.env.BREVO_PORT), // 587
        secure: false,                         // false for port 587
        auth: {
            user: process.env.BREVO_USER,     // your brevo login email
            pass: process.env.BREVO_PASS,     // brevo SMTP key (NOT login password)
        },
    });
};

// ─── Send OTP Email ───────────────────────────────────────────
const sendOTPEmail = async ({ name, email, otp, role }) => {
    try {
        const transporter = createTransporter();

        const templatePath = path.join(__dirname, '../views/emails/otpEmail.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp, role });

        const info = await transporter.sendMail({
            from: `"Sellora" <${process.env.BREVO_USER}>`,
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
            BREVO_HOST: process.env.BREVO_HOST   ? '✅ set' : '❌ missing',
            BREVO_USER: process.env.BREVO_USER   ? '✅ set' : '❌ missing',
            BREVO_PASS: process.env.BREVO_PASS   ? '✅ set' : '❌ missing',
        });
        return { success: false, error: error.message };
    }
};

// ─── Send Password Reset Email ────────────────────────────────
const sendPasswordResetEmail = async ({ name, email, otp, role }) => {
    try {
        const transporter = createTransporter();

        const templatePath = path.join(__dirname, '../views/emails/resetPasswordEmail.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp, role });

        const info = await transporter.sendMail({
            from: `"Sellora" <${process.env.BREVO_USER}>`,
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
            BREVO_HOST: process.env.BREVO_HOST   ? '✅ set' : '❌ missing',
            BREVO_USER: process.env.BREVO_USER   ? '✅ set' : '❌ missing',
            BREVO_PASS: process.env.BREVO_PASS   ? '✅ set' : '❌ missing',
        });
        return { success: false, error: error.message };
    }
};

export { sendOTPEmail, sendPasswordResetEmail };