const User = require('./User');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductVariant = require('./ProductVariant');
const CartItem = require('./CartItem');
const WishlistItem = require('./WishlistItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Hubungan Produk -> Gambar
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Hubungan Produk -> Varian
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Hubungan Keranjang Belanja
User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });
ProductVariant.hasMany(CartItem, { foreignKey: 'productVariantId', as: 'cartItems' });
// PERBAIKAN FINAL: Mengganti alias 'variant' menjadi 'product_variant'
CartItem.belongsTo(ProductVariant, { foreignKey: 'productVariantId', as: 'product_variant' });

// Hubungan Wishlist
User.hasMany(WishlistItem, { foreignKey: 'userId' });
WishlistItem.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(WishlistItem, { foreignKey: 'productId' });
WishlistItem.belongsTo(Product, { foreignKey: 'productId' });

// Hubungan Order
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'productVariantId', as: 'orderItems' });
// PERBAIKAN FINAL: Mengganti alias 'variant' menjadi 'product_variant'
OrderItem.belongsTo(ProductVariant, { foreignKey: 'productVariantId', as: 'product_variant' });

module.exports = {
  User,
  Product,
  ProductImage,
  ProductVariant,
  CartItem,
  WishlistItem,
  Order,
  OrderItem,
};
