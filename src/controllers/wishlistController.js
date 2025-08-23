// src/controllers/wishlistController.js
const { WishlistItem, Product, ProductImage } = require('../models');

// Menambahkan produk ke wishlist
const addToWishlist = async (req, res) => {
    try {
        console.log("Body yang diterima untuk addToWishlist:", req.body);

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

// --- FUNGSI GET WISHLIST (DISEMPURNAKAN) ---
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

        // PERBAIKAN: Format ulang respons untuk memperbaiki URL gambar
        const formattedWishlist = wishlistItems.map(item => {
            const itemJson = item.toJSON();
            // Cek apakah produk dan gambar ada sebelum diakses
            const hasProduct = itemJson.Product;
            const hasImage = hasProduct && hasProduct.images && hasProduct.images.length > 0;

            const mainImage = hasImage
                ? hasProduct.images[0].image_url.replace(/\\/g, '/')
                : null;
            
            return {
                id: itemJson.id,
                createdAt: itemJson.createdAt,
                updatedAt: itemJson.updatedAt,
                userId: itemJson.userId,
                productId: itemJson.productId,
                Product: hasProduct ? {
                    id: hasProduct.id,
                    name: hasProduct.name,
                    price: hasProduct.price,
                    // Tambahkan pengecekan gambar di sini juga
                    images: hasImage ? [{ image_url: mainImage }] : []
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