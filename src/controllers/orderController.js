const { Order, OrderItem, CartItem, Product, User } = require('../models');
const { sequelize } = require('../config/database');

// --- FUNGSI CREATE ORDER ---
const createOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.userId;
        const { shipping_address, shipping_method, payment_method } = req.body;

        const shippingCosts = { 'JNE': 10000, 'TIKI': 12000, 'SiCepat': 8000 };
        const shippingFee = shippingCosts[shipping_method];
        if (shippingFee === undefined) {
            await t.rollback();
            return res.status(400).json({ message: 'Metode pengiriman tidak valid.' });
        }

        const cartItems = await CartItem.findAll({
            where: { userId },
            include: [Product],
            transaction: t,
        });

        if (cartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Keranjang Anda kosong.' });
        }

        let subtotal = 0;
        for (const item of cartItems) {
            if (item.Product.stock < item.quantity) {
                await t.rollback();
                return res.status(400).json({ message: `Stok untuk produk ${item.Product.name} tidak mencukupi.` });
            }
            subtotal += item.quantity * item.Product.price;
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
            productId: item.productId,
            quantity: item.quantity,
            price: item.Product.price,
        }));
        await OrderItem.bulkCreate(orderItems, { transaction: t });

        for (const item of cartItems) {
            const product = await Product.findByPk(item.productId, { transaction: t, lock: true });
            await product.update({ stock: product.stock - item.quantity }, { transaction: t });
        }

        await CartItem.destroy({ where: { userId }, transaction: t });

        await t.commit();
        res.status(201).json({ message: 'Pesanan berhasil dibuat.', order: newOrder });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI PENGGUNA MELIHAT RIWAYAT PESANANNYA ---
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await Order.findAll({
            where: { userId },
            include: [
                {
                    model: OrderItem,
                    include: {
                        model: Product,
                        attributes: ['id', 'name']
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

// --- FUNGSI ADMIN MELIHAT SEMUA PESANAN (DENGAN FILTER) ---
const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query; // Ambil status dari query parameter
        const whereClause = {};

        // Jika ada query status, tambahkan ke filter
        if (status) {
            whereClause.status = status;
        }

        const orders = await Order.findAll({
            where: whereClause, // Terapkan filter di sini
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

// --- FUNGSI ADMIN MENGUBAH STATUS PESANAN ---
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
            order: order
        });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
};