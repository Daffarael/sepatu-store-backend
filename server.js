require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, testDbConnection } = require('./src/config/database');

// --- PERBAIKAN 1: Impor Semua Model & Relasinya dari satu tempat ---
require('./src/models');

// Impor semua rute
const mainRoutes = require('./src/routes/mainRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes'); // Ditambahkan

const app = express();
const PORT = process.env.PORT || 3000;

// --- PERBAIKAN 2: Konfigurasi CORS yang lebih lengkap ---
const allowedOrigins = [
  'http://localhost:5173', // Alamat frontend lokal
  'https://a565e9923645.ngrok-free.app' // Alamat Ngrok frontend Anda
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Akses diblokir oleh kebijakan CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'ngrok-skip-browser-warning'
  ],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- PERBAIKAN 3: Middleware untuk file statis diletakkan di atas ---
// Ini memastikan permintaan gambar dilayani terlebih dahulu.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware Logger
app.use((req, res, next) => {
    res.on('finish', () => {
        if (req.user) {
            console.log(
                // PERBAIKAN 4: Menggunakan req.user.id
                `[AKTIVITAS] User ID: ${req.user.id} (Role: ${req.user.role}) mengakses -> ${req.method} ${req.originalUrl}`
            );
        }
    });
    next();
});

// Registrasi Rute
app.use('/', mainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes); // Rute dasbor ditambahkan

// Fungsi untuk memulai server
const startServer = async () => {
    try {
        await testDbConnection();
        await sequelize.sync({ alter: true });
        console.log('Semua model telah disinkronkan. 🔄');
        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT} 🚀`);
        });
    } catch (error) {
        console.error('Gagal memulai server:', error);
    }
};

startServer();