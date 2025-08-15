const express = require('express');
const router = express.Router();

const { getUserProfile, getAllUsers } = require('../controllers/userController');
const { protect, isAdmin } = require('../middleware/authMiddleware'); // Impor isAdmin

// Rute untuk mendapatkan profil sendiri (dijaga oleh 'protect')
router.get('/profile', protect, getUserProfile);

// Rute untuk mendapatkan semua user (dijaga oleh 'protect' DAN 'isAdmin') (BARU)
router.get('/all', protect, isAdmin, getAllUsers);

module.exports = router;
