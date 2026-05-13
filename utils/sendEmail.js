import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import nodemailer from 'nodemailer'
import ejs from 'ejs'
import fs from 'fs';

import env from 'dotenv'
env.config();

import dns from 'dns';

// ✅ Force Node to prefer IPv4 over IPv6.
// This fixes the ENETUNREACH error on Render where IPv6 is unreachable.
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// ✅ Verify SMTP connection on startup (optional but helpful for debugging)
const verifyTransporter = async (transporter) => {
    try {
        await transporter.verify();
        console.log("✅ [Email] SMTP connection verified successfully.");
        return true;
    } catch (err) {
        console.error("❌ [Email] SMTP verification failed:", err.message);
        return false;
    }
};

const createTransporter = () => {
    // ✅ Strip all whitespace and newlines from credentials (common copy-paste issue)
    const user = process.env.EMAIL_USER?.trim().replace(/\s/g, "");
    const pass = process.env.EMAIL_PASS?.trim().replace(/\s/g, "");

    console.log(`[Email] Creating transporter for ${user ? 'user: ' + user : 'MISSING USER'}`);

    if (!user || !pass) {
        console.warn("⚠️  WARNING: EMAIL_USER or EMAIL_PASS is not defined. Emails will fail.");
    }

    // ✅ Gmail SMTP with:
    //    - family: 4         → Force IPv4 (fixes ENETUNREACH on Render)
    //    - tls settings      → Fix SSL issues in cloud environments
    //    - increased timeouts → Prevent premature timeout on cold starts
    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // use STARTTLS (not SSL)
        auth: {
            user: user,
            pass: pass, // ← Must be a 16-char Gmail App Password, NOT your Gmail login password
        },
        family: 4, // ✅ CRITICAL FIX: Force IPv4 for Render/cloud environments
        tls: {
            rejectUnauthorized: false, // ✅ Fix for SSL cert issues on Render
            ciphers: 'SSLv3',
        },
        connectionTimeout: 15000, // 15s
        greetingTimeout: 15000,   // 15s
        socketTimeout: 20000,     // 20s
    });
};

// ─────────────────────────────────────────────
// 📧 Send OTP Email
// ─────────────────────────────────────────────
const sendOTPEmail = async ({ name, email, otp, role }) => {
    const user = process.env.EMAIL_USER?.trim().replace(/\s/g, "");
    const pass = process.env.EMAIL_PASS?.trim().replace(/\s/g, "");

    console.log(`[Email] Step 1: Initiating OTP email to ${email}`);
    console.log(`[Email] Env Check: USER=${user ? 'SET (' + user + ')' : 'MISSING'}, PASS=${pass ? 'SET (length=' + pass.length + ')' : 'MISSING'}`);

    // ✅ Validate App Password length (Gmail App Passwords are always 16 chars)
    if (pass && pass.length !== 16) {
        console.warn(`⚠️  [Email] WARNING: EMAIL_PASS length is ${pass.length}. Gmail App Passwords are exactly 16 characters. Are you using your regular Gmail password instead?`);
    }

    try {
        if (!user || !pass) {
            console.error("[Email] CRITICAL: SMTP credentials missing in .env!");
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

        // ✅ Optional: verify connection before sending
        await verifyTransporter(transporter);

        const mailOptions = {
            from: `"Sellora" <${user}>`,
            to: email,
            subject: role?.toLowerCase() === "admin"
                ? "🔐 Sellora Admin Panel - OTP Verification"
                : "🛍️ Welcome to Sellora! Your OTP Verification Code",
            html: htmlContent,
        };

        console.log(`[Email] Step 3: Sending OTP mail to ${email} via smtp.gmail.com:587...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Success: OTP email sent to ${email} | MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        // ✅ Enhanced error messages with actionable hints
        let hint = "";
        if (error.code === "EAUTH") {
            hint = "👉 Authentication failed. Make sure you're using a Gmail App Password (not your Gmail login password). Enable 2FA first, then generate an App Password at: https://myaccount.google.com/apppasswords";
        } else if (error.code === "ENETUNREACH") {
            hint = "👉 Network unreachable. Check if DNS is resolving and IPv4 is forced (family: 4).";
        } else if (error.code === "ETIMEDOUT" || error.code === "ESOCKET") {
            hint = "👉 Connection timed out. Render may be blocking outbound SMTP on port 587. Try port 465 with secure: true.";
        } else if (error.code === "ECONNREFUSED") {
            hint = "👉 Connection refused. SMTP host or port may be incorrect.";
        }

        console.error("❌ OTP Email sending failed:", error.message);
        console.error("   Error code:", error.code);
        if (hint) console.error("   Hint:", hint);

        return { success: false, error: error.message, code: error.code, hint };
    }
};

// ─────────────────────────────────────────────
// 🔒 Send Password Reset Email
// ─────────────────────────────────────────────
const sendPasswordResetEmail = async ({ name, email, otp, role }) => {
    const user = process.env.EMAIL_USER?.trim().replace(/\s/g, "");
    const pass = process.env.EMAIL_PASS?.trim().replace(/\s/g, "");

    console.log(`[Email] Step 1: Initiating Password Reset email to ${email}`);
    console.log(`[Email] Env Check: USER=${user ? 'SET (' + user + ')' : 'MISSING'}, PASS=${pass ? 'SET (length=' + pass.length + ')' : 'MISSING'}`);

    // ✅ Validate App Password length
    if (pass && pass.length !== 16) {
        console.warn(`⚠️  [Email] WARNING: EMAIL_PASS length is ${pass.length}. Gmail App Passwords are exactly 16 characters.`);
    }

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

        // ✅ Optional: verify connection before sending
        await verifyTransporter(transporter);

        const mailOptions = {
            from: `"Sellora Security" <${user}>`,
            to: email,
            subject: "🔒 Password Reset Request - Sellora",
            html: htmlContent,
        };

        console.log(`[Email] Step 3: Sending Password Reset mail to ${email} via smtp.gmail.com:587...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Success: Password reset email sent to ${email} | MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        // ✅ Enhanced error messages with actionable hints
        let hint = "";
        if (error.code === "EAUTH") {
            hint = "👉 Authentication failed. Make sure you're using a Gmail App Password (not your Gmail login password). Enable 2FA first, then generate an App Password at: https://myaccount.google.com/apppasswords";
        } else if (error.code === "ENETUNREACH") {
            hint = "👉 Network unreachable. Check if DNS is resolving and IPv4 is forced (family: 4).";
        } else if (error.code === "ETIMEDOUT" || error.code === "ESOCKET") {
            hint = "👉 Connection timed out. Render may be blocking outbound SMTP on port 587. Try port 465 with secure: true.";
        } else if (error.code === "ECONNREFUSED") {
            hint = "👉 Connection refused. SMTP host or port may be incorrect.";
        }

        console.error("❌ Password reset email sending failed:", error.message);
        console.error("   Error code:", error.code);
        if (hint) console.error("   Hint:", hint);

        return { success: false, error: error.message, code: error.code, hint };
    }
};

export {
    sendOTPEmail,
    sendPasswordResetEmail,
};