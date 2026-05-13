import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import nodemailer from 'nodemailer'
import ejs from 'ejs'

import env from 'dotenv'
env.config();

const createTransporter = () => {
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.trim()?.replace(/\s/g, "");

    console.log(`[Email] Creating transporter for ${user ? 'user: ' + user : 'MISSING USER'}`);

    if (!user || !pass) {
        console.warn("⚠️ WARNING: EMAIL_USER or EMAIL_PASS is not defined. Emails will fail.");
    }

    // Using 'service: gmail' is the most reliable way for Gmail
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass,
        },
        // Standard timeouts
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
}

import fs from 'fs';

const sendOTPEmail = async ({ name, email, otp, role }) => {
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.trim();

    console.log(`[Email] Step 1: Initiating OTP email to ${email}`);

    try {
        if (!user || !pass) {
            throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variables.");
        }

        const templatePath = path.join(__dirname, "../views/emails/otpEmail.ejs");
        
        if (!fs.existsSync(templatePath)) {
            console.error(`[Email] CRITICAL: Template not found at ${templatePath}`);
            throw new Error("Email template file missing.");
        }

        console.log(`[Email] Step 2: Rendering template from ${templatePath}`);
        const htmlContent = await ejs.renderFile(templatePath, { name, otp, role });

        const transporter = createTransporter();
        const mailOptions = {
            from: `"Sellora" <${user}>`,
            to: email,
            subject: role?.toLowerCase() === "admin" 
                ? "🔐 Sellora Admin Panel - OTP Verification" 
                : "🛍️ Welcome to Sellora! Your OTP Verification Code",
            html: htmlContent,
        };

        console.log(`[Email] Step 3: Sending mail via smtp.gmail.com:587...`);
        await transporter.sendMail(mailOptions);
        console.log(`✅ Success: OTP email sent to ${email}`);

    } catch (error) {
        // ✅ Log but NEVER throw — email failure must not block the API response
        console.error("❌ OTP Email sending failed:", error.message);
        console.error("   Error code:", error.code);
        console.error("   Recipient:", email);
        console.error("   Full error:", error);
    }

};

const sendPasswordResetEmail = async ({ name, email, otp, role }) => {
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.trim();

    console.log(`[Email] Step 1: Initiating Password Reset email to ${email}`);
    
    try {
        if (!user || !pass) {
            throw new Error("Missing EMAIL_USER or EMAIL_PASS environment variables.");
        }

        const templatePath = path.join(__dirname, "../views/emails/resetPasswordEmail.ejs");
        
        if (!fs.existsSync(templatePath)) {
            console.error(`[Email] CRITICAL: Template not found at ${templatePath}`);
            throw new Error("Email template file missing.");
        }

        console.log(`[Email] Step 2: Rendering template from ${templatePath}`);
        const htmlContent = await ejs.renderFile(templatePath, { name, otp, role });

        const transporter = createTransporter();
        const mailOptions = {
            from: `"Sellora Security" <${user}>`,
            to: email,
            subject: "🔒 Password Reset Request - Sellora",
            html: htmlContent,
        }

        console.log(`[Email] Step 3: Sending mail via smtp.gmail.com:587...`);
        await transporter.sendMail(mailOptions);
        console.log(`✅ Success: Password reset email sent to ${email}`);

    } catch (error) {
        // ✅ Log but NEVER throw — email failure must not block the API response
        console.error("❌ Password reset email sending failed:", error.message);
        console.error("   Error code:", error.code);
        console.error("   Recipient:", email);
        console.error("   Full error:", error);
    }
};

export {
    sendOTPEmail, sendPasswordResetEmail
}