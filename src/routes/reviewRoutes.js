// src/routes/reviewRoutes.js

const express = require('express');
const router = express.Router();

// --- PERBAIKAN: Impor fungsi 'getReviewsByProduct' ---
const { addReview, getReviewsByProduct } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// --- PERBAIKAN: Gunakan router.route() untuk menggabungkan rute ---
router.route('/product/:productId')
    // Rute untuk melihat semua ulasan dari sebuah produk (tidak perlu login)
    .get(getReviewsByProduct)
    // Rute untuk user menambahkan ulasan ke sebuah produk (memerlukan login)
    .post(protect, addReview);

module.exports = router;