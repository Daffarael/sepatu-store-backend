// src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { getMainStats } = require('../controllers/dashboardController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rute untuk mendapatkan statistik utama di dasbor
// Endpoint ini harus dilindungi dan hanya bisa diakses oleh admin
router.get('/stats', protect, isAdmin, getMainStats);

module.exports = router;