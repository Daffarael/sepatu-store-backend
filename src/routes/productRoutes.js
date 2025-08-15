// src/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');

// --- PERBAIKAN: Impor fungsi 'getAllTypes' ---
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getAllTypes // <-- DITAMBAHKAN
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


// --- RUTE PUBLIK DENGAN URUTAN YANG BENAR ---

// Rute untuk mendapatkan semua produk (paling umum)
router.get('/', getAllProducts);

// --- PERBAIKAN: Rute spesifik '/types' ditempatkan SEBELUM rute dinamis '/:id' ---
// Rute untuk mendapatkan daftar tipe unik
router.get('/types', getAllTypes);

// Rute untuk mendapatkan detail produk berdasarkan ID (paling dinamis, jadi ditaruh paling bawah)
router.get('/:id', optionalProtect, getProductById);


module.exports = router;