// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const { 
    createOrder, 
    createDirectOrder, 
    getMyOrders, 
    getMyOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelMyOrder,
    getOrderByIdForAdmin
} = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// --- RUTE UNTUK MEMBUAT PESANAN ---
router.post('/', protect, createOrder);
router.post('/direct-checkout', protect, createDirectOrder);

// --- RUTE KHUSUS ADMIN ---
router.get('/', protect, isAdmin, getAllOrders);
// DIPINDAHKAN KE ATAS: Rute detail untuk admin harus sebelum rute detail user
router.get('/:orderId/detail', protect, isAdmin, getOrderByIdForAdmin); 
router.put('/:orderId/status', protect, isAdmin, updateOrderStatus);

// --- RUTE UNTUK PENGGUNA MELIHAT & MENGELOLA PESANANNYA ---
router.get('/my-orders', protect, getMyOrders);
router.put('/:orderId/cancel', protect, cancelMyOrder);
// Rute untuk user melihat detail pesanannya sendiri (sekarang di posisi yang benar)
router.get('/:orderId', protect, getMyOrderById); 

module.exports = router;
