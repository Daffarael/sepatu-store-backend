// src/models/ProductVariant.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  size: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  productId: { // Kolom foreign key
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products', // Nama tabel
      key: 'id',
    },
  },
}, {
  timestamps: false,
});

module.exports = ProductVariant;
