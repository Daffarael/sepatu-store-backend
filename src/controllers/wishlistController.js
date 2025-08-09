const { WishlistItem, Product, ProductImage } = require('../models');

// Menambahkan produk ke wishlist
const addToWishlist = async (req, res) => {
    try {
        const userId = req.user.userId; // Diambil dari token setelah login
        const { productId } = req.body;

        // Cek agar tidak menambah produk yang sama dua kali
        const existingItem = await WishlistItem.findOne({ where: { userId, productId } });
        if (existingItem) {
            return res.status(400).json({ message: 'Produk ini sudah ada di wishlist Anda.' });
        }

        const wishlistItem = await WishlistItem.create({ userId, productId });
        res.status(201).json({ message: 'Produk berhasil ditambahkan ke wishlist.', wishlistItem });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Melihat semua isi wishlist pengguna
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const wishlistItems = await WishlistItem.findAll({
            where: { userId },
            include: { // Sertakan detail produk untuk setiap item di wishlist
                model: Product,
                attributes: ['id', 'name', 'price'],
                include: { // Sertakan juga gambar produknya
                    model: ProductImage,
                    as: 'images',
                    attributes: ['image_url'],
                    limit: 1 // Cukup ambil 1 gambar sebagai thumbnail
                }
            }
        });
        res.status(200).json(wishlistItems);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Menghapus produk dari wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params; // Ambil productId dari URL

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