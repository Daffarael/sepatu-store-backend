// src/controllers/reviewController.js

const { Review, Product, Order, OrderItem, ProductVariant, User } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const addReview = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { rating, comment } = req.body;

        // --- PEROMBAKAN TOTAL LOGIKA VALIDASI ---
        // Langkah A: Cari semua ID pesanan dari user ini yang statusnya Delivered.
        const deliveredOrders = await Order.findAll({
            where: { userId: userId, status: 'Delivered' },
            attributes: ['id']
        });

        if (deliveredOrders.length === 0) {
            await t.rollback();
            return res.status(403).json({ message: 'Anda tidak memiliki pesanan yang sudah selesai untuk memberi ulasan.' });
        }
        const deliveredOrderIds = deliveredOrders.map(order => order.id);

        // Langkah B: Cari semua ID varian yang dimiliki oleh produk yang akan di-review.
        const productVariants = await ProductVariant.findAll({
            where: { productId: productId },
            attributes: ['id']
        });
        if (productVariants.length === 0) {
            await t.rollback();
            return res.status(404).json({ message: 'Produk ini tidak memiliki varian.' });
        }
        const productVariantIds = productVariants.map(variant => variant.id);

        // Langkah C: Cek apakah ada OrderItem yang cocok dengan kedua kriteria di atas.
        const hasPurchased = await OrderItem.findOne({
            where: {
                orderId: { [Op.in]: deliveredOrderIds },
                productVariantId: { [Op.in]: productVariantIds }
            }
        });

        if (!hasPurchased) {
            await t.rollback();
            return res.status(403).json({ message: 'Anda hanya bisa memberi ulasan untuk produk yang sudah Anda beli dan terima.' });
        }
        // --- AKHIR PEROMBAKAN ---

        const existingReview = await Review.findOne({ where: { userId, productId } });
        if (existingReview) {
            await t.rollback();
            return res.status(400).json({ message: 'Anda sudah pernah memberikan ulasan untuk produk ini.' });
        }

        await Review.create({ userId, productId, rating, comment }, { transaction: t });

        const reviewsData = await Review.findAll({
            where: { productId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
            ],
            raw: true,
            transaction: t
        });
        const { avgRating, reviewCount } = reviewsData[0];

        await Product.update({
            rating: parseFloat(avgRating).toFixed(1),
            reviewCount: reviewCount
        }, {
            where: { id: productId },
            transaction: t
        });

        await t.commit();
        res.status(201).json({ message: 'Ulasan Anda berhasil ditambahkan.' });

    } catch (error) {
        await t.rollback();
        console.error("Error di addReview:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

const getReviewsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.findAll({
            where: { productId: productId },
            include: {
                model: User,
                as: 'user',
                attributes: ['fullName']
            },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error di getReviewsByProduct:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    addReview,
    getReviewsByProduct
};