// src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();

// --- PERBAIKAN: Impor fungsi 'getTopSellingProducts' ---
const { 
    getMainStats, 
    getRecentOrders, 
    getRecentUsers, 
    getLowStockProducts, 
    getTopSellingProducts 
} = require('../controllers/dashboardController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rute untuk statistik utama
router.get('/stats', protect, isAdmin, getMainStats);

// Rute untuk aktivitas terbaru
router.get('/recent-orders', protect, isAdmin, getRecentOrders);
router.get('/recent-users', protect, isAdmin, getRecentUsers);

// Rute untuk notifikasi
router.get('/low-stock', protect, isAdmin, getLowStockProducts);

// --- RUTE BARU: Mendapatkan Produk Terlaris ---
router.get('/top-selling', protect, isAdmin, getTopSellingProducts);

module.exports = router;