const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rute untuk registrasi
router.post('/register', authController.register);

// Rute untuk login
router.post('/login', authController.login);

// Rute untuk meminta kode reset password
router.post('/forgot-password', authController.forgotPassword);

// Rute untuk mereset password dengan kode
// (Ini sudah benar, tidak lagi menggunakan /:token di URL)
router.put('/reset-password', authController.resetPassword);

module.exports = router;