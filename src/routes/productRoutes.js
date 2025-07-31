const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { createProduct } = require('../controllers/productController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// Konfigurasi Multer (tetap sama)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'product-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- PERUBAHAN DI BARIS INI ---
// Diubah dari upload.single('image') menjadi upload.array('images', 5)
// 'images' adalah nama field baru, dan 5 adalah jumlah maksimal file
router.post('/', protect, isAdmin, upload.array('images', 5), createProduct);

module.exports = router;