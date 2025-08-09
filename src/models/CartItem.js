// src/models/CartItem.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  // Kolom userId dan productId akan ditambahkan otomatis oleh relasi
}, {
  timestamps: true,
});

module.exports = CartItem;