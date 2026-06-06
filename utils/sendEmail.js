import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// ✅ Fixed: port 587 + secure false (STARTTLS) is more reliable than 465
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,        // STARTTLS — do NOT use true with port 587
    family: 4,            // ✅ Force IPv4 to fix ENETUNREACH on Render
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,  // ⚠️ Must be Gmail App Password, NOT your Gmail login password
    },
    tls: {
        rejectUnauthorized: false,     // Avoids TLS cert issues in some environments
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

// ─── Verify transporter connection on startup ─────────────────
transporter.verify((error, success) => {
    if (error) {
        console.error('[Email] SMTP connection failed:', error.message);
    } else {
        console.log('[Email] SMTP server is ready to send emails');
    }
});

// ─── Send OTP Email ───────────────────────────────────────────
const sendOTPEmail = async ({ name, email, otp, role }, retries = 3) => {
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

        if (retries > 0) {
            console.log(`[Email] Retrying OTP email... (${retries} retries left)`);
            await new Promise(res => setTimeout(res, 1000)); // wait 1s before retry
            return sendOTPEmail({ name, email, otp, role }, retries - 1);
        }

        return { success: false, error: error.message };
    }
};

// ─── Send Password Reset Email ────────────────────────────────
const sendPasswordResetEmail = async ({ name, email, otp, role }, retries = 3) => {
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

        if (retries > 0) {
            console.log(`[Email] Retrying reset email... (${retries} retries left)`);
            await new Promise(res => setTimeout(res, 1000)); // wait 1s before retry
            return sendPasswordResetEmail({ name, email, otp, role }, retries - 1);
        }

        return { success: false, error: error.message };
    }
};

export { sendOTPEmail, sendPasswordResetEmail };