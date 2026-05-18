import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Resend Client ────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Helper: Render EJS Template ─────────────────────────
const renderTemplate = async (templateName, data) => {
    const templatePath = path.join(__dirname, '../views/emails', templateName);
    return await ejs.renderFile(templatePath, data);
};

// ─── Helper: Send with Retry ──────────────────────────────
const sendWithRetry = async (payload, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        try {
            const { data, error } = await resend.emails.send(payload);
            if (error) throw new Error(error.message);
            return data;
        } catch (err) {
            if (i === retries) throw err;
            console.warn(`[Email] Retry ${i + 1} after error: ${err.message}`);
            await new Promise(res => setTimeout(res, 1000 * (i + 1))); // exponential wait
        }
    }
};

// ─── Send OTP Email ───────────────────────────────────────
const sendOTPEmail = async ({ name, email, otp, role }) => {
    try {
        const html = await renderTemplate('otpEmail.ejs', { name, otp, role });

        const data = await sendWithRetry({
            from: `Sellora <${process.env.EMAIL_FROM}>`,  // e.g. noreply@yourdomain.com
            to: email,
            subject: 'OTP Verification Code',
            html,
        });

        console.log(`[Email] OTP sent to ${email} — id: ${data.id}`);
        return { success: true };

    } catch (error) {
        console.error('[Email] sendOTPEmail failed:', error.message);
        return { success: false, error: error.message };
    }
};

// ─── Send Password Reset Email ────────────────────────────
const sendPasswordResetEmail = async ({ name, email, otp, role }) => {
    try {
        const html = await renderTemplate('resetPasswordEmail.ejs', { name, otp, role });

        const data = await sendWithRetry({
            from: `Sellora <${process.env.EMAIL_FROM}>`,  // e.g. noreply@yourdomain.com
            to: email,
            subject: 'Password Reset Code',
            html,
        });

        console.log(`[Email] Reset email sent to ${email} — id: ${data.id}`);
        return { success: true };

    } catch (error) {
        console.error('[Email] sendPasswordResetEmail failed:', error.message);
        return { success: false, error: error.message };
    }
};

export { sendOTPEmail, sendPasswordResetEmail };