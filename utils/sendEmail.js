import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Resend } from 'resend';
import ejs from 'ejs';
import fs from 'fs';

import env from 'dotenv';
env.config();

// ─────────────────────────────────────────────
// ✅ Resend Client
// Get your free API key at: https://resend.com
// Add to Render env: RESEND_API_KEY=re_xxxxxxxx
// ─────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─────────────────────────────────────────────
// ✅ Sender address
// OPTION A (Quick start - no domain needed):
//   Use: onboarding@resend.dev  ← works immediately for testing
//   NOTE: Can only send to your own verified email on free plan
//
// OPTION B (Production - recommended):
//   Verify your own domain on resend.com → Domains
//   Use: noreply@yourdomain.com
// ─────────────────────────────────────────────
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

// ─────────────────────────────────────────────
// 📧 Send OTP Email
// ─────────────────────────────────────────────
const sendOTPEmail = async ({ name, email, otp, role }) => {
    console.log(`[Email] Step 1: Initiating OTP email to ${email}`);
    console.log(`[Email] Env Check: RESEND_API_KEY=${process.env.RESEND_API_KEY ? 'SET' : '❌ MISSING'}`);

    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("Missing RESEND_API_KEY environment variable. Get it at https://resend.com");
        }

        const templatePath = path.join(__dirname, "../views/emails/otpEmail.ejs");

        if (!fs.existsSync(templatePath)) {
            console.error(`[Email] CRITICAL: Template not found at ${templatePath}`);
            throw new Error("Email template file missing.");
        }

        console.log(`[Email] Step 2: Rendering template from ${templatePath}`);
        const htmlContent = await ejs.renderFile(templatePath, { name, otp, role });

        const subject = role?.toLowerCase() === "admin"
            ? "🔐 Sellora Admin Panel - OTP Verification"
            : "🛍️ Welcome to Sellora! Your OTP Verification Code";

        console.log(`[Email] Step 3: Sending OTP mail via Resend to ${email}...`);

        const { data, error } = await resend.emails.send({
            from: `Sellora <${FROM_EMAIL}>`,
            to: [email],
            subject: subject,
            html: htmlContent,
        });

        if (error) {
            console.error("❌ Resend API error:", error);
            return { success: false, error: error.message, code: error.name };
        }

        console.log(`✅ Success: OTP email sent to ${email} | Resend ID: ${data.id}`);
        return { success: true, messageId: data.id };

    } catch (error) {
        console.error("❌ OTP Email sending failed:", error.message);
        return { success: false, error: error.message };
    }
};

// ─────────────────────────────────────────────
// 🔒 Send Password Reset Email
// ─────────────────────────────────────────────
const sendPasswordResetEmail = async ({ name, email, otp, role }) => {
    console.log(`[Email] Step 1: Initiating Password Reset email to ${email}`);
    console.log(`[Email] Env Check: RESEND_API_KEY=${process.env.RESEND_API_KEY ? 'SET' : '❌ MISSING'}`);

    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("Missing RESEND_API_KEY environment variable. Get it at https://resend.com");
        }

        const templatePath = path.join(__dirname, "../views/emails/resetPasswordEmail.ejs");

        if (!fs.existsSync(templatePath)) {
            console.error(`[Email] CRITICAL: Template not found at ${templatePath}`);
            throw new Error("Email template file missing.");
        }

        console.log(`[Email] Step 2: Rendering template from ${templatePath}`);
        const htmlContent = await ejs.renderFile(templatePath, { name, otp, role });

        console.log(`[Email] Step 3: Sending Password Reset mail via Resend to ${email}...`);

        const { data, error } = await resend.emails.send({
            from: `Sellora Security <${FROM_EMAIL}>`,
            to: [email],
            subject: "🔒 Password Reset Request - Sellora",
            html: htmlContent,
        });

        if (error) {
            console.error("❌ Resend API error:", error);
            return { success: false, error: error.message, code: error.name };
        }

        console.log(`✅ Success: Password reset email sent to ${email} | Resend ID: ${data.id}`);
        return { success: true, messageId: data.id };

    } catch (error) {
        console.error("❌ Password reset email sending failed:", error.message);
        return { success: false, error: error.message };
    }
};

export {
    sendOTPEmail,
    sendPasswordResetEmail,
};