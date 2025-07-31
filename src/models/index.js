// src/models/index.js
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const User = require('./User'); // Impor User juga jika perlu

// Definisikan Hubungan
Product.hasMany(ProductImage, {
  foreignKey: 'productId',
  as: 'images',
});

ProductImage.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

// Ekspor semua model Anda dari satu tempat
module.exports = {
  User,
  Product,
  ProductImage,
};