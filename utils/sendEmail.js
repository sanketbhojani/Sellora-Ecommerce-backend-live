import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',   
    port: 465,
    secure: true,
    family: 4,                
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

// ─── Send OTP Email ───────────────────────────────────────────
const sendOTPEmail = async ({ name, email, otp, role }, retries = 3) => {
    try {
        const templatePath = path.join(__dirname, '../views/emails/otpEmail.ejs');
        const html = await ejs.renderFile(templatePath, { name, otp, role });

        if (resend) {
            const { data, error } = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: email,
                subject: 'OTP Verification Code',
                html: html,
            });
            if (error) throw new Error(error.message);
            console.log(`[Email] OTP sent via Resend to ${email} — ID: ${data?.id}`);
            return { success: true };
        } else {
            const info = await transporter.sendMail({
                from: `"Sellora" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'OTP Verification Code',
                html,
            });
            console.log(`[Email] OTP sent to ${email} — messageId: ${info.messageId}`);
            return { success: true };
        }
    } catch (error) {
        console.error('[Email] sendOTPEmail failed:', error.message);
        if (retries > 0) {
            console.log(`[Email] Retrying OTP email... (${retries} retries left)`);
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

        if (resend) {
            const { data, error } = await resend.emails.send({
                from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
                to: email,
                subject: 'Password Reset Code',
                html: html,
            });
            if (error) throw new Error(error.message);
            console.log(`[Email] Reset sent via Resend to ${email} — ID: ${data?.id}`);
            return { success: true };
        } else {
            const info = await transporter.sendMail({
                from: `"Sellora" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Password Reset Code',
                html,
            });
            console.log(`[Email] Reset email sent to ${email} — messageId: ${info.messageId}`);
            return { success: true };
        }
    } catch (error) {
        console.error('[Email] sendPasswordResetEmail failed:', error.message);
        if (retries > 0) {
            console.log(`[Email] Retrying reset email... (${retries} retries left)`);
            return sendPasswordResetEmail({ name, email, otp, role }, retries - 1);
        }
        return { success: false, error: error.message };
    }
};

export { sendOTPEmail, sendPasswordResetEmail };