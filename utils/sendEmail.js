import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import nodemailer from 'nodemailer'
import ejs from 'ejs'

import env from 'dotenv'
env.config();

const createTransporter = () => {
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // use SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS?.replace(/\s/g, ""), // Strip spaces for reliability
        },
        // ✅ Timeout so it never hangs indefinitely
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
}

const sendOTPEmail = async ({ name, email, otp, role }) => {
    console.log(`Starting sendOTPEmail to: ${email}`);
    try {
        console.log("Environment check:", {
            user: process.env.EMAIL_USER ? "set" : "MISSING",
            pass: process.env.EMAIL_PASS ? "set" : "MISSING"
        });
        const templatePath = path.join(
            __dirname,
            "../views/emails/otpEmail.ejs"
        );

        const htmlContent = await ejs.renderFile(templatePath, {
            name,
            otp,
            role
        });

        const transporter = createTransporter();

        const mailOptions = {
            from: `"Sellora" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "🛍️ Welcome to Sellora! Your OTP Verification Code",
            html: htmlContent,
        };

        console.log("Attempting to send email...");
        await transporter.sendMail(mailOptions);
        console.log(`✅ Success: OTP email sent to: ${email}`);

    } catch (error) {
        // ✅ Log but NEVER throw — email failure must not block the API response
        console.error("❌ OTP Email sending failed:", error.message);
        console.error("   Error code:", error.code);
        console.error("   Recipient:", email);
        console.error("   Full error:", error);
    }

};

const sendPasswordResetEmail = async ({ name, email, otp, role }) => {
    try {
        const templatePath = path.join(
            __dirname,
            "../views/emails/resetPasswordEmail.ejs"
        );

        const htmlContent = await ejs.renderFile(templatePath, {
            name,
            otp,
            role
        });

        const transporter = createTransporter();

        const mailOptions = {
            from: `"Sellora Security" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "🔒 Password Reset Request - Sellora",
            html: htmlContent,
        }

        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to: ${email}`);

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