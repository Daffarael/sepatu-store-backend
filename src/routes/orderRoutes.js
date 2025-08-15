const express = require('express');
const router = express.Router();

const {
  createOrder, // Ini untuk checkout dari keranjang
  createDirectOrder, // <-- Ini fungsi baru untuk direct checkout
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');

const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- RUTE CHECKOUT (VIA KERANJANG) ---
// Rute untuk user membuat pesanan dari keranjang
router.post('/', protect, createOrder);

// --- RUTE DIRECT CHECKOUT (TANPA KERANJANG) ---
// Rute baru untuk user membuat pesanan secara langsung
router.post('/direct-checkout', protect, createDirectOrder); // <-- Rute baru

// --- RUTE RIWAYAT & ADMIN ---
// Rute untuk user melihat riwayat pesanannya sendiri
router.get('/my-orders', protect, getMyOrders);

// Rute untuk admin melihat semua pesanan
router.get('/', protect, isAdmin, getAllOrders);

// Rute untuk admin mengubah status pesanan berdasarkan ID pesanan
router.put('/:orderId/status', protect, isAdmin, updateOrderStatus);

module.exports = router;
