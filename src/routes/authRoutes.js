const express = require('express');
const router = express.Router();

// Impor semua fungsi yang diperlukan dari authController
const { 
    register, 
    login, 
    forgotPassword, 
    verifyCode, 
    resetPassword,
    refreshToken, // Ditambahkan
    logout       // Ditambahkan
} = require('../controllers/authController');

// Impor middleware yang benar
const { protectReset } = require('../middleware/authMiddleware');

// Rute untuk registrasi
router.post('/register', register);

// Rute untuk login
router.post('/login', login);

// --- RUTE BARU: REFRESH TOKEN & LOGOUT ---
// Rute untuk merefresh access token menggunakan refresh token
router.post('/refresh', refreshToken);

// Rute untuk logout
router.post('/logout', logout);

// --- ALUR LUPA PASSWORD 3 LANGKAH ---

// 1. Minta kode reset
router.post('/forgot-password', forgotPassword);

// 2. Verifikasi kode dan dapatkan token sementara
router.post('/verify-code', verifyCode);

// 3. Reset password menggunakan token sementara
router.put('/reset-password', protectReset, resetPassword);


module.exports = router;