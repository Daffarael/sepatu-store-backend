const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, testDbConnection } = require('./src/config/database');

// Impor semua rute
const mainRoutes = require('./src/routes/mainRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes'); // <-- Ini yang hilang

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors()); // Mengizinkan akses dari frontend
app.use(express.json()); // Membaca body JSON
app.use(express.urlencoded({ extended: true })); // Membaca body form-data

// Membuat folder 'uploads' bisa diakses dari luar
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Menggunakan Rute ---
app.use('/', mainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes); // <-- Ini yang hilang

const startServer = async () => {
  await testDbConnection();
  await sequelize.sync({ alter: true });
  console.log("Semua model telah disinkronkan. 🔄");
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT} 🚀`);
  });
};

startServer();