// src/controllers/wishlistController.js
const { WishlistItem, Product, ProductImage } = require('../models');

// Menambahkan produk ke wishlist
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user ? (req.user.id || req.user.userId) : null;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User tidak terautentikasi.' });
        }

        const existingItem = await WishlistItem.findOne({ where: { userId, productId } });
        if (existingItem) {
            return res.status(400).json({ message: 'Produk ini sudah ada di wishlist Anda.' });
        }

        const wishlistItem = await WishlistItem.create({ userId, productId });
        res.status(201).json({ message: 'Produk berhasil ditambahkan ke wishlist.', wishlistItem });

    } catch (error) {
        console.error("Error di dalam addToWishlist:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Melihat semua isi wishlist pengguna (DIPERBARUI)
const getWishlist = async (req, res) => {
    try {
        const userId = req.user ? (req.user.id || req.user.userId) : null;

        if (!userId) {
            return res.status(401).json({ message: 'User tidak terautentikasi.' });
        }

        const wishlistItems = await WishlistItem.findAll({
            where: { userId },
            include: {
                model: Product,
                include: {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['image_url'],
                    limit: 1
                }
            }
        });

        // Format ulang respons agar lebih rapi
        const formattedWishlist = wishlistItems.map(item => {
            const itemJson = item.toJSON();
            const productData = itemJson.Product;
            
            const mainImage = productData && productData.images && productData.images.length > 0
                ? productData.images[0].image_url.replace(/\\/g, '/')
                : null;
            
            return {
                id: itemJson.id,
                createdAt: itemJson.createdAt,
                updatedAt: itemJson.updatedAt,
                userId: itemJson.userId,
                productId: itemJson.productId,
                Product: productData ? {
                    id: productData.id,
                    name: productData.name,
                    price: productData.price,
                    image: mainImage // Menggunakan format yang lebih sederhana
                } : null
            };
        });

        res.status(200).json(formattedWishlist);
    } catch (error) {
        console.error("Error di getWishlist:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Menghapus produk dari wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user ? (req.user.id || req.user.userId) : null;
        const { productId } = req.params;

        if (!userId) {
            return res.status(401).json({ message: 'User tidak terautentikasi.' });
        }

        const result = await WishlistItem.destroy({
            where: { userId, productId }
        });

        if (result === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan di wishlist Anda.' });
        }

        res.status(200).json({ message: 'Produk berhasil dihapus dari wishlist.' });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
};
