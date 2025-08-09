const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER, // Harga produk pada saat dibeli
    allowNull: false,
  },
}, {
  timestamps: false,
});

module.exports = OrderItem;