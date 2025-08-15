require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, testDbConnection } = require('./src/config/database');

// --- PENTING: IMPOR HANYA MODEL YANG SUDAH DIBUAT ---
// Pastikan hanya model yang sudah ada di direktori Anda yang diimpor.
const Product = require('./src/models/Product');
const ProductImage = require('./src/models/ProductImage');
const ProductVariant = require('./src/models/ProductVariant');
const User = require('./src/models/User');
const WishlistItem = require('./src/models/WishlistItem');

// const Cart = require('./src/models/Cart'); // Baris ini dan yang lain dihapus atau dikomentari
// const Order = require('./src/models/Order');

const mainRoutes = require('./src/routes/mainRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  res.on('finish', () => {
    if (req.user) {
      console.log(
        `[AKTIVITAS] User ID: ${req.user.userId} (Role: ${req.user.role}) mengakses -> ${req.method} ${req.originalUrl}`
      );
    }
  });
  next();
});

app.use('/', mainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);

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
