// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    createDirectOrder, 
    getMyOrders, 
    getMyOrderById,
    getAllOrders,
    updateOrderStatus 
} = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- RUTE UNTUK MEMBUAT PESANAN ---
router.post('/', protect, createOrder);
router.post('/direct-checkout', protect, createDirectOrder);


// --- RUTE UNTUK PENGGUNA MELIHAT PESANANNYA ---
// PERBAIKAN: Rute spesifik '/my-orders' diletakkan di atas rute dinamis '/:orderId'
router.get('/my-orders', protect, getMyOrders);
router.get('/:orderId', protect, getMyOrderById);


// --- RUTE KHUSUS ADMIN ---
router.get('/', protect, isAdmin, getAllOrders);
router.put('/:orderId/status', protect, isAdmin, updateOrderStatus);

module.exports = router;