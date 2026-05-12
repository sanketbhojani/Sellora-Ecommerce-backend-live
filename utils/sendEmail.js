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
        service:"gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });
}

const sendOTPEmail = async ({ name, email, otp, role }) => {
    try {
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

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to: ${email}`);


    } catch (error) {
        console.error("Email sending failed:", error.message);
        throw new Error("Failed to send OTP email. Please try again.")
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
        console.error("Password reset email sending failed:", error.message);
        throw new Error("Failed to send Password reset email. Please try again.")
    }
};

export {
    sendOTPEmail, sendPasswordResetEmail
}