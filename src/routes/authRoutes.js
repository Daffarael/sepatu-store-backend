const express = require('express');
const router = express.Router();
// --- PERBAIKI DI SINI: Impor semua fungsi yang dibutuhkan ---
const { 
    register, 
    login, 
    forgotPassword, 
    verifyCode, 
    resetPassword 
} = require('../controllers/authController');
// --- PERBAIKI DI SINI: Impor middleware yang benar ---
const { protectReset } = require('../middleware/authMiddleware');

// Rute untuk registrasi
router.post('/register', register);

// Rute untuk login
router.post('/login', login);


// --- ALUR LUPA PASSWORD 3 LANGKAH ---

// 1. Minta kode reset
router.post('/forgot-password', forgotPassword);

// 2. Verifikasi kode dan dapatkan token sementara
router.post('/verify-code', verifyCode);

// 3. Reset password menggunakan token sementara
router.put('/reset-password', protectReset, resetPassword);


module.exports = router;