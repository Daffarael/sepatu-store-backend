const { CartItem, Product, ProductImage } = require('../models');

// Menambah item ke keranjang
const addToCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;

        const product = await Product.findByPk(productId);
        if (!product || product.stock < quantity) {
            return res.status(400).json({ message: 'Produk tidak tersedia atau stok tidak cukup.' });
        }

        let cartItem = await CartItem.findOne({ where: { userId, productId } });

        if (cartItem) {
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({ userId, productId, quantity });
        }

        res.status(200).json({ message: 'Produk berhasil ditambahkan ke keranjang.', cartItem });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Melihat isi keranjang (DENGAN PERBAIKAN)
const getCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: { 
                model: Product,
                attributes: ['id', 'name', 'price'], // Hapus 'image' dari sini
                include: { // <-- Tambahkan 'include' baru di dalam Product
                    model: ProductImage,
                    as: 'images',
                    attributes: ['image_url'],
                    limit: 1 // Ambil 1 gambar saja untuk thumbnail
                }
            }
        });

        res.status(200).json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Mengubah kuantitas item
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Kuantitas tidak boleh kurang dari 1.' });
        }

        const cartItem = await CartItem.findOne({ where: { userId, productId } });
        if (!cartItem) {
            return res.status(404).json({ message: 'Item tidak ditemukan di keranjang.' });
        }

        const product = await Product.findByPk(productId);
        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Stok produk tidak mencukupi.' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        res.status(200).json({ message: 'Kuantitas item berhasil diperbarui.', cartItem });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Menghapus item dari keranjang
const removeCartItem = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        const result = await CartItem.destroy({ where: { userId, productId } });

        if (result === 0) {
            return res.status(404).json({ message: 'Item tidak ditemukan di keranjang.' });
        }

        res.status(200).json({ message: 'Item berhasil dihapus dari keranjang.' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
};