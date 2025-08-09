const { Sequelize } = require('sequelize');

// Konfigurasi sekarang membaca dari file .env
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Koneksi ke database berhasil. ✅');
  } catch (error) {
    console.error('Tidak dapat terhubung ke database: ❌', error);
  }
};

module.exports = { sequelize, testDbConnection };