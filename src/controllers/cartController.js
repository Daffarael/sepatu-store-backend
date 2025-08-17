const { CartItem, Product, ProductImage, ProductVariant } = require('../models');

// addToCart disesuaikan dengan req.user.id
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productVariantId, quantity } = req.body;

        const variant = await ProductVariant.findByPk(productVariantId);

        if (!variant || variant.stock < quantity) {
            return res.status(400).json({ message: 'Varian produk tidak tersedia atau stok tidak cukup.' });
        }

        let cartItem = await CartItem.findOne({
            where: { userId, productVariantId }
        });

        if (cartItem) {
            const newQuantity = cartItem.quantity + quantity;
            if (variant.stock < newQuantity) {
                return res.status(400).json({ message: 'Jumlah yang diminta melebihi stok yang tersedia.' });
            }
            cartItem.quantity = newQuantity;
            await cartItem.save();
        } else {
            cartItem = await CartItem.create({ userId, productVariantId, quantity });
        }

        const responseItem = {
            id: cartItem.id,
            quantity: cartItem.quantity,
            userId: cartItem.userId,
            productVariantId: cartItem.productVariantId,
            updatedAt: cartItem.updatedAt,
            createdAt: cartItem.createdAt
        };

        res.status(200).json({ message: 'Produk berhasil ditambahkan ke keranjang.', cartItem: responseItem });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// getCart disesuaikan dengan alias baru
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: {
                model: ProductVariant,
                as: 'variantDetails', // <-- PERBAIKAN: Menggunakan alias unik yang baru
                attributes: ['id', 'size', 'stock'],
                include: {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'brand', 'price'],
                    include: {
                        model: ProductImage,
                        as: 'images',
                        attributes: ['image_url'],
                        limit: 1
                    }
                }
            }
        });

        const formattedCart = cartItems.map(item => ({
            cartItemId: item.id,
            quantity: item.quantity,
            variantId: item.variantDetails.id, // <-- PERBAIKAN: Disesuaikan dengan alias baru
            size: item.variantDetails.size,
            stock: item.variantDetails.stock,
            price: item.variantDetails.product.price,
            product: {
                id: item.variantDetails.product.id,
                name: item.variantDetails.product.name,
                brand: item.variantDetails.product.brand,
                image: item.variantDetails.product.images.length > 0 ? item.variantDetails.product.images[0].image_url : null,
            },
            subtotal: item.quantity * item.variantDetails.product.price,
        }));

        res.status(200).json(formattedCart);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// updateCartItem disesuaikan dengan req.user.id
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productVariantId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Kuantitas tidak boleh kurang dari 1.' });
        }

        const cartItem = await CartItem.findOne({ where: { userId, productVariantId } });
        if (!cartItem) {
            return res.status(404).json({ message: 'Item tidak ditemukan di keranjang.' });
        }

        const variant = await ProductVariant.findByPk(productVariantId);
        if (variant.stock < quantity) {
            return res.status(400).json({ message: 'Stok produk tidak mencukupi.' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        const responseItem = {
            id: cartItem.id,
            quantity: cartItem.quantity,
            userId: cartItem.userId,
            productVariantId: cartItem.productVariantId,
            updatedAt: cartItem.updatedAt,
            createdAt: cartItem.createdAt
        };

        res.status(200).json({ message: 'Kuantitas item berhasil diperbarui.', cartItem: responseItem });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// removeCartItem disesuaikan dengan req.user.id
const removeCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productVariantId } = req.params;

        const result = await CartItem.destroy({ where: { userId, productVariantId } });

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