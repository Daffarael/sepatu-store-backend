// src/routes/addressRoutes.js

const express = require('express');
const router = express.Router();
const {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setPrimaryAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

// Rute untuk mendapatkan semua alamat dan menambah alamat baru
router.route('/')
    .get(protect, getAddresses)
    .post(protect, addAddress);

// Rute untuk mengedit dan menghapus alamat berdasarkan ID
router.route('/:addressId')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

// Rute untuk menjadikan alamat sebagai alamat utama
router.put('/:addressId/set-primary', protect, setPrimaryAddress);

module.exports = router;

