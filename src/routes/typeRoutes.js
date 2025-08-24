const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rute untuk publik (melihat semua tipe yang aktif)
router.get('/', typeController.getAllTypes);

// Rute untuk admin (menambah tipe baru)
router.post('/', protect, isAdmin, typeController.createType);

// Rute untuk mengubah status tipe
router.put('/:id/status', protect, isAdmin, typeController.updateTypeStatus);

// RUTE BARU: Untuk mengubah nama tipe
router.put('/:id', protect, isAdmin, typeController.updateType);

// RUTE BARU: Untuk menghapus tipe
router.delete('/:id', protect, isAdmin, typeController.deleteType);

module.exports = router;