const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rute untuk publik (hanya melihat semua tipe)
router.get('/', typeController.getAllTypes);

// Rute untuk admin (menambah tipe baru)
router.post('/', protect, isAdmin, typeController.createType);

module.exports = router;