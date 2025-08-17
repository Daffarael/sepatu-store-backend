// routes/userRoutes.js

const express = require('express');
const router = express.Router();

// --- PERBAIKAN: 'updateUserRole' dihapus dari impor ---
const { 
    getUserProfile, 
    getAllUsers,
    toggleBlockStatus
} = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rute untuk pengguna biasa
router.get('/profile', protect, getUserProfile);

// --- RUTE KHUSUS ADMIN ---
router.get('/all', protect, isAdmin, getAllUsers);

// Rute untuk memblokir/membuka blokir pengguna berdasarkan ID
router.put('/:id/toggle-block', protect, isAdmin, toggleBlockStatus);

// Rute untuk mengubah peran sudah dihapus

module.exports = router;