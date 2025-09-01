require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, testDbConnection } = require('./src/config/database');

// Impor semua model dan relasinya dari satu tempat
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
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const addressRoutes = require('./src/routes/addressRoutes');
const typeRoutes = require('./src/routes/typeRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Konfigurasi CORS yang Fleksibel untuk Pengembangan ---
const allowedOrigins = [
  'http://localhost:5173', // Alamat frontend lokal
];

const corsOptions = {
  origin: function (origin, callback) {
    // PERBAIKAN: Izinkan jika origin ada di daftar, ATAU jika origin berasal dari ngrok
    const isAllowed = allowedOrigins.includes(origin) || /.*\.ngrok-free\.app$/.test(origin);
    
    if (isAllowed || !origin) { // !origin mengizinkan Postman/aplikasi sejenis
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware Logger sederhana
app.use((req, res, next) => {
    if (req.user) { 
        res.on('finish', () => {
            console.log(
                `[AKTIVITAS] User ID: ${req.user.id} (Role: ${req.user.role}) -> ${req.method} ${req.originalUrl}`
            );
        });
    }
    next();
});

// Registrasi Semua Rute API
app.use('/', mainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/analytics', analyticsRoutes);

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
