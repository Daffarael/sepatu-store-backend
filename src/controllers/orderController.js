// controllers/orderController.js

// PERBAIKAN: Impor sequelize dari config/database, bukan dari models
const { Order, OrderItem, CartItem, Product, ProductVariant, User } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');


// --- FUNGSI CREATE ORDER (VIA KERANJANG) ---
const createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const { shipping_address, shipping_method, payment_method } = req.body;

        const shippingCosts = { JNE: 10000, TIKI: 12000, SiCepat: 8000 };
        const shippingFee = shippingCosts[shipping_method];
        if (shippingFee === undefined) {
            await t.rollback();
            return res.status(400).json({ message: 'Metode pengiriman tidak valid.' });
        }

        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [{
                model: ProductVariant,
                as: 'product_variant',
                include: {
                    model: Product,
                    as: 'product'
                }
            }],
            transaction: t,
        });

        if (cartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Keranjang Anda kosong.' });
        }

        let subtotal = 0;
        for (const item of cartItems) {
            if (item.product_variant.stock < item.quantity) {
                await t.rollback();
                return res.status(400).json({
                    message: `Stok untuk produk ${item.product_variant.product.name} (Ukuran ${item.product_variant.size}) tidak mencukupi.`,
                });
            }
            subtotal += item.quantity * item.product_variant.product.price;
        }

        const totalPrice = subtotal + shippingFee;

        const newOrder = await Order.create({
            userId,
            shipping_address,
            shipping_method,
            payment_method,
            total_price: totalPrice,
            status: 'Pending',
        }, { transaction: t });

        const orderItems = cartItems.map(item => ({
            orderId: newOrder.id,
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            price: item.product_variant.product.price,
        }));
        await OrderItem.bulkCreate(orderItems, { transaction: t });

        for (const item of cartItems) {
            const variant = await ProductVariant.findByPk(item.productVariantId, { transaction: t, lock: true });
            await variant.update({ stock: variant.stock - item.quantity }, { transaction: t });

            const product = await Product.findByPk(variant.productId, { transaction: t });
            await product.update({ sold: product.sold + item.quantity }, { transaction: t });
        }

        await CartItem.destroy({ where: { userId }, transaction: t });

        await t.commit();
        res.status(201).json({ message: 'Pesanan berhasil dibuat.', order: newOrder });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI CREATE DIRECT ORDER ---
const createDirectOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const {
            shipping_address,
            shipping_method,
            payment_method,
            items
        } = req.body;

        const shippingCosts = { JNE: 10000, TIKI: 12000, SiCepat: 8000 };
        const shippingFee = shippingCosts[shipping_method];
        if (shippingFee === undefined) {
            await t.rollback();
            return res.status(400).json({ message: 'Metode pengiriman tidak valid.' });
        }

        if (!items || items.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Daftar produk yang dipesan kosong.' });
        }

        let subtotal = 0;
        const processedItems = [];

        for (const item of items) {
            const variant = await ProductVariant.findByPk(item.productVariantId, {
                include: { model: Product, as: 'product' },
                transaction: t,
            });

            if (!variant || variant.stock < item.quantity) {
                await t.rollback();
                return res.status(400).json({
                    message: `Stok untuk varian produk ${variant ? variant.product.name : 'tidak dikenal'} (Ukuran ${variant ? variant.size : ''}) tidak mencukupi.`
                });
            }
            subtotal += item.quantity * variant.product.price;
            processedItems.push({ variant, quantity: item.quantity });
        }

        const totalPrice = subtotal + shippingFee;

        const newOrder = await Order.create({
            userId,
            shipping_address,
            shipping_method,
            payment_method,
            total_price: totalPrice,
            status: 'Pending',
        }, { transaction: t });

        const orderItems = processedItems.map(item => ({
            orderId: newOrder.id,
            productVariantId: item.variant.id,
            quantity: item.quantity,
            price: item.variant.product.price,
        }));
        await OrderItem.bulkCreate(orderItems, { transaction: t });

        for (const item of processedItems) {
            const variant = await ProductVariant.findByPk(item.variant.id, { transaction: t, lock: true });
            await variant.update({ stock: variant.stock - item.quantity }, { transaction: t });

            const product = await Product.findByPk(variant.productId, { transaction: t });
            await product.update({ sold: product.sold + item.quantity }, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ message: 'Pesanan langsung berhasil dibuat.', order: newOrder });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI PENGGUNA MELIHAT RIWAYAT PESANANNYA ---
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.findAll({
            where: { userId },
            include: [
                {
                    model: OrderItem,
                    include: {
                        model: ProductVariant,
                        as: 'product_variant',
                        attributes: ['size'],
                        include: {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name']
                        }
                    }
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI ADMIN ---
const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        const orders = await Order.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['id', 'fullName', 'email']
                }
            ],
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

        res.status(200).json({
            message: `Status pesanan berhasil diubah menjadi ${status}`,
            order
        });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    createOrder,
    createDirectOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
};