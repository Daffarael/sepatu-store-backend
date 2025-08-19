// routes/userRoutes.js

const express = require('express');
const router = express.Router();

// --- PERBAIKAN: Impor fungsi 'getUserById' dan hapus 'updateUserRole' ---
const { 
    getUserProfile, 
    getAllUsers,
    toggleBlockStatus,
    getUserById 
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- RUTE PUBLIK & PENGGUNA BIASA ---
// Rute untuk mendapatkan profil sendiri (dijaga oleh 'protect')
router.get('/profile', protect, getUserProfile);


// --- RUTE KHUSUS ADMIN ---

// Rute untuk mendapatkan semua user (paling umum, jadi di atas)
router.get('/all', protect, isAdmin, getAllUsers);

// Rute untuk memblokir/membuka blokir pengguna berdasarkan ID
router.put('/:id/toggle-block', protect, isAdmin, toggleBlockStatus);

// --- PERBAIKAN: Rute baru untuk mendapatkan detail satu pengguna ---
// Rute ini harus di bawah rute yang lebih spesifik seperti '/all'
router.get('/:id', protect, isAdmin, getUserById);

// Rute untuk mengubah peran sudah dihapus

module.exports = router;