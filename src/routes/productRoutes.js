const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
// --- UBAH DI SINI: Impor fungsi 'deleteProduct' ---
const { 
  createProduct, 
  getAllProducts, 
  getProductById,
  updateProduct,
  deleteProduct 
} = require('../controllers/productController');
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

// --- Rute CRUD Produk ---
// Create
router.post('/', protect, isAdmin, upload.array('images', 5), createProduct);

// Read
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Update
router.put('/:id', protect, isAdmin, updateProduct);

// --- TAMBAHKAN BARIS BARU DI SINI ---
// Delete (Soft Delete)
router.delete('/:id', protect, isAdmin, deleteProduct);


module.exports = router;