// src/routes/addressRoutes.js

const express = require('express');
const router = express.Router();
const { getMyAddress, addAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

// Semua rute di sini memerlukan login
router.use(protect);

// Rute untuk mengelola satu alamat milik pengguna
router.route('/')
    .get(getMyAddress)     // Melihat alamat
    .post(addAddress)      // Menambah alamat (hanya jika belum ada)
    .put(updateAddress)    // Memperbarui alamat
    .delete(deleteAddress);// Menghapus alamat

module.exports = router;