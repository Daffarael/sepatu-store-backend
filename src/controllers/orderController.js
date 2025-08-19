// controllers/orderController.js

const { Order, OrderItem, CartItem, Product, ProductVariant, User, Address } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');


// --- FUNGSI CREATE ORDER (DARI KERANJANG) ---
const createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        // 1. Ambil data dari body (TANPA 'items')
        const {
            addressId,
            shippingMethod,
            shippingCost,
            paymentMethod
        } = req.body;

        if (!addressId || !shippingMethod || !shippingCost || !paymentMethod) {
            await t.rollback();
            return res.status(400).json({ message: 'Alamat, metode pengiriman, biaya kirim, dan metode pembayaran harus diisi.' });
        }

        // 2. Ambil detail alamat dari database
        const address = await Address.findOne({ where: { id: addressId, userId: userId } });
        if (!address) {
            await t.rollback();
            return res.status(404).json({ message: 'Alamat pengiriman tidak ditemukan.' });
        }
        const fullShippingAddress = `${address.recipientName} (${address.phoneNumber})\n${address.streetAddress}, ${address.village}, ${address.district}\n${address.city}, ${address.province}`;

        // 3. Ambil semua item dari KERANJANG pengguna
        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [{
                model: ProductVariant,
                as: 'variantDetails',
                include: {
                    model: Product,
                    as: 'product'
                }
            }],
        });

        if (cartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Keranjang Anda kosong.' });
        }

        // 4. Validasi stok dan hitung subtotal
        let subtotal = 0;
        for (const item of cartItems) {
            if (item.variantDetails.stock < item.quantity) {
                await t.rollback();
                return res.status(400).json({
                    message: `Stok untuk produk ${item.variantDetails.product.name} (Ukuran ${item.variantDetails.size}) tidak mencukupi.`,
                });
            }
            subtotal += item.quantity * item.variantDetails.product.price;
        }

        const totalPrice = subtotal + parseInt(shippingCost);

        // 5. Buat entri 'Orders' dan 'OrderItems'
        const newOrder = await Order.create({
            userId,
            shipping_address: fullShippingAddress,
            shipping_method: shippingMethod,
            payment_method: paymentMethod,
            total_price: totalPrice,
            status: 'Pending',
        }, { transaction: t });

        const orderItems = cartItems.map(item => ({
            orderId: newOrder.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            price: item.variantDetails.product.price,
        }));
        await OrderItem.bulkCreate(orderItems, { transaction: t });

        // 6. Kurangi stok produk
        for (const item of cartItems) {
            const variant = await ProductVariant.findByPk(item.productVariantId, { transaction: t, lock: true });
            await variant.update({ stock: variant.stock - item.quantity }, { transaction: t });
            const product = await Product.findByPk(variant.productId, { transaction: t });
            await product.update({ sold: product.sold + item.quantity }, { transaction: t });
        }

        // 7. Kosongkan keranjang
        await CartItem.destroy({ where: { userId }, transaction: t });
        await t.commit();
        res.status(201).json({ message: 'Pesanan berhasil dibuat.', order: newOrder });

    } catch (error) {
        await t.rollback();
        console.error("Error di createOrder (dari keranjang):", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};


// --- FUNGSI CREATE DIRECT ORDER (DENGAN 'items' di body) ---
const createDirectOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const {
            addressId,
            shippingMethod,
            shippingCost,
            paymentMethod,
            items
        } = req.body;

        if (!addressId || !shippingMethod || !shippingCost || !paymentMethod || !items || items.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Semua data pesanan (alamat, pengiriman, pembayaran, dan item) harus diisi.' });
        }

        const address = await Address.findOne({ where: { id: addressId, userId: userId } });
        if (!address) {
            await t.rollback();
            return res.status(404).json({ message: 'Alamat pengiriman tidak ditemukan.' });
        }
        const fullShippingAddress = `${address.recipientName} (${address.phoneNumber})\n${address.streetAddress}, ${address.village}, ${address.district}\n${address.city}, ${address.province}`;

        let subtotal = 0;
        const orderItemsData = [];

        for (const item of items) {
            const variant = await ProductVariant.findByPk(item.productVariantId, {
                include: { model: Product, as: 'product' }
            });

            if (!variant || variant.stock < item.quantity) {
                await t.rollback();
                return res.status(400).json({
                    message: `Stok untuk produk ${variant ? variant.product.name : 'tidak dikenal'} (Ukuran ${variant ? variant.size : ''}) tidak mencukupi.`
                });
            }
            subtotal += item.quantity * variant.product.price;
            orderItemsData.push({
                productVariantId: item.productVariantId,
                quantity: item.quantity,
                price: variant.product.price
            });
        }

        const totalPrice = subtotal + parseInt(shippingCost);

        const newOrder = await Order.create({
            userId,
            shipping_address: fullShippingAddress,
            shipping_method: shippingMethod,
            payment_method: paymentMethod,
            total_price: totalPrice,
            status: 'Pending',
        }, { transaction: t });

        const finalOrderItems = orderItemsData.map(item => ({
            ...item,
            orderId: newOrder.id,
        }));
        await OrderItem.bulkCreate(finalOrderItems, { transaction: t });

        for (const item of orderItemsData) {
            const variant = await ProductVariant.findByPk(item.productVariantId, { transaction: t, lock: true });
            await variant.update({ stock: variant.stock - item.quantity }, { transaction: t });
            const product = await Product.findByPk(variant.productId, { transaction: t });
            await product.update({ sold: product.sold + item.quantity }, { transaction: t });
        }
        
        await t.commit();
        res.status(201).json({ message: 'Pesanan langsung berhasil dibuat.', order: newOrder });

    } catch (error) {
        await t.rollback();
        console.error("Error di createDirectOrder:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};


// --- FUNGSI BARU: Melihat Detail Satu Pesanan Spesifik ---
const getMyOrderById = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params; // Ambil ID pesanan dari URL

        const order = await Order.findOne({
            where: { 
                id: orderId, 
                userId: userId // Pastikan pesanan ini milik pengguna yang login
            },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: {
                        model: ProductVariant,
                        as: 'variantDetails',
                        attributes: ['size'],
                        include: {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'brand']
                        }
                    }
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan atau Anda tidak memiliki akses.' });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};


// --- FUNGSI UNTUK MELIHAT SEMUA RIWAYAT PESANAN ---
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};
const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = {};
        if (status) { whereClause.status = status; }
        const orders = await Order.findAll({
            where: whereClause,
            include: [{ model: User, attributes: ['id', 'fullName', 'email'] }],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const validStatuses = ['Pending', 'Paid', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Status tidak valid.' });
        }
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
        }
        order.status = status;
        await order.save();
        res.status(200).json({ message: `Status pesanan berhasil diubah menjadi ${status}`, order });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    createOrder,
    createDirectOrder,
    getMyOrders,
    getMyOrderById,
    getAllOrders,
    updateOrderStatus,
};