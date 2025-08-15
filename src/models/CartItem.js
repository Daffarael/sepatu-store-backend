const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ProductVariant = require('./ProductVariant'); 
const User = require('./User'); 

const CartItem = sequelize.define('CartItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  timestamps: true,
});

// Definisikan relasi
User.hasMany(CartItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

// Tambahkan alias 'variant' secara eksplisit untuk relasi ini
CartItem.belongsTo(ProductVariant, { as: 'variant', foreignKey: 'variantId' });

module.exports = CartItem;
