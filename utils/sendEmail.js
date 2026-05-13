import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendOTPEmail = async ({ name, email, otp, role }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const templatePath = path.join(__dirname, '../views/emails/otpEmail.ejs');
    const html = await ejs.renderFile(templatePath, { name, otp, role });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP Verification Code',
      html: html,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async ({ name, email, otp, role }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const templatePath = path.join(__dirname, '../views/emails/resetPasswordEmail.ejs');
    const html = await ejs.renderFile(templatePath, { name, otp, role });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Code',
      html: html,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
};

export { sendOTPEmail, sendPasswordResetEmail };