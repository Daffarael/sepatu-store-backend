const { Sequelize } = require('sequelize');

// Ganti 'root' dan '' (password kosong) sesuai pengaturan MySQL Anda
const sequelize = new Sequelize('sepatu_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Koneksi ke database berhasil. ✅');
  } catch (error) {
    console.error('Tidak dapat terhubung ke database: ❌', error);
  }
};

module.exports = { sequelize, testDbConnection };