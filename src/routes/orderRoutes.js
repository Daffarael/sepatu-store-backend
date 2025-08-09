const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    getMyOrders, 
    getAllOrders,
    updateOrderStatus 
} = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rute untuk user membuat pesanan
router.post('/', protect, createOrder);

// Rute untuk user melihat riwayat pesanannya sendiri
router.get('/my-orders', protect, getMyOrders);

// Rute untuk admin melihat semua pesanan
router.get('/', protect, isAdmin, getAllOrders);

// Rute untuk admin mengubah status pesanan berdasarkan ID pesanan
router.put('/:orderId/status', protect, isAdmin, updateOrderStatus);

module.exports = router;