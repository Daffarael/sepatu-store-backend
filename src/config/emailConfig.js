// src/config/emailConfig.js

const emailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Membaca email dari .env
    pass: process.env.GMAIL_PASS, // Membaca App Password dari .env
  },
};

module.exports = emailConfig;