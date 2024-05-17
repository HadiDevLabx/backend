const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
require('dotenv').config();

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',  
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
  });
  const domain = process.env.DOMAIN;

  const mailOptions = {
    from: 'hamdan12122211@gmail.com',
    to: email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking the following link: ${domain}/api/auth/verify-email?token=${token}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info('Verification email sent', { email });
  } catch (error) {
    logger.error('Failed to send verification email', { error: error.message });
    throw new Error('Email could not be sent');
  }
};

module.exports = sendVerificationEmail;
