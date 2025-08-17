require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, testDbConnection } = require('./src/config/database');

// --- PERBAIKAN: Impor Semua Model & Relasinya ---
require('./src/models');

// Impor semua rute
const mainRoutes = require('./src/routes/mainRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes'); // <-- 1. IMPOR RUTE BARU

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi CORS
const corsOptions = {
  origin: ['http://localhost:3001', 'http://localhost:5173'], 
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

// Middleware untuk file statis
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware Logger
app.use((req, res, next) => {
    res.on('finish', () => {
        if (req.user) {
            console.log(
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
app.use('/api/reviews', reviewRoutes); // <-- 2. GUNAKAN RUTE BARU

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