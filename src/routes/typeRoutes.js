const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Rute untuk publik (hanya melihat tipe yang aktif)
router.get('/', typeController.getAllTypes);

// RUTE BARU: Untuk admin, melihat SEMUA tipe (aktif & tidak aktif)
router.get('/all', protect, isAdmin, typeController.getAllTypesForAdmin);

// Rute untuk mengambil satu tipe berdasarkan ID (untuk form edit)
router.get('/:id', protect, isAdmin, typeController.getTypeById);

// Rute untuk menambah tipe baru
router.post('/', protect, isAdmin, typeController.createType);

// Rute untuk mengubah nama dan/atau status tipe
router.put('/:id', protect, isAdmin, typeController.updateType);

// Rute untuk menghapus tipe
router.delete('/:id', protect, isAdmin, typeController.deleteType);

module.exports = router;