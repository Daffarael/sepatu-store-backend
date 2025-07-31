const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'), // <-- TAMBAHAN
    allowNull: false,
    defaultValue: 'Active',
  },
  is_deleted: {
    type: DataTypes.BOOLEAN, // <-- TAMBAHAN
    allowNull: false,
    defaultValue: false,
  },
  // Kolom 'image' dihapus dari sini
}, {
  timestamps: true,
});

module.exports = Product;