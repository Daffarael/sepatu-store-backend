// models/index.js

const User = require('./User');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductVariant = require('./ProductVariant');
const CartItem = require('./CartItem');
const WishlistItem = require('./WishlistItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Address = require('./Address');
const Type = require('./Type'); // DITAMBAHKAN

// Relasi Produk
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Relasi Keranjang Belanja
User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });
ProductVariant.hasMany(CartItem, { foreignKey: 'productVariantId' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'productVariantId', as: 'variantDetails' });

// Relasi Wishlist
User.hasMany(WishlistItem, { foreignKey: 'userId' });
WishlistItem.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(WishlistItem, { foreignKey: 'productId' });
WishlistItem.belongsTo(Product, { foreignKey: 'productId' });

// Relasi Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'productVariantId' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'productVariantId', as: 'variantDetails' });

// Relasi Review
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Relasi Alamat
User.hasOne(Address, { foreignKey: 'userId', as: 'address' }); // Diperbaiki ke hasOne untuk konsistensi
Address.belongsTo(User, { foreignKey: 'userId' });

// Relasi Tipe dan Produk (DITAMBAHKAN)
Type.hasMany(Product, { foreignKey: 'typeId' });
Product.belongsTo(Type, { foreignKey: 'typeId', as: 'type' });


// Ekspor semua model
module.exports = {
  User, Product, ProductImage, ProductVariant, CartItem,
  WishlistItem, Order, OrderItem, Review, Address, Type 
};