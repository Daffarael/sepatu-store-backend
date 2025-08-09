// src/models/WishlistItem.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WishlistItem = sequelize.define('WishlistItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  // Kolom userId dan productId akan ditambahkan oleh relasi
}, {
  timestamps: true,
});

module.exports = WishlistItem;