// src/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

const {
    createProduct,
    getAllProducts,
    getAllProductsForAdmin, // DITAMBAHKAN
    getProductById,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect, isAdmin, optionalProtect } = require('../middleware/authMiddleware');

// Konfigurasi Multer untuk penyimpanan file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, 'product-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Rute untuk Admin (Create, Update, Delete)
router.post('/', protect, isAdmin, upload.array('images', 5), createProduct);
router.put('/:id', protect, isAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, isAdmin, deleteProduct);


// --- RUTE PUBLIK & ADMIN ---

// RUTE BARU: Untuk admin melihat SEMUA produk (aktif & tidak aktif)
router.get('/all', protect, isAdmin, getAllProductsForAdmin);

// Rute untuk publik melihat produk yang aktif
router.get('/', getAllProducts);

// Rute untuk detail produk
router.get('/:id', optionalProtect, getProductById);


module.exports = router;
