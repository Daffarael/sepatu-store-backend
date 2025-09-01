// src/controllers/dashboardController.js

const { User, Product, Order, ProductVariant, OrderItem } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// --- FUNGSI UNTUK STATISTIK UTAMA ---
const getMainStats = async (req, res) => {
    try {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        // Menggunakan Promise.all agar semua query berjalan bersamaan
        const [totalUsers, totalProducts, totalOrders, monthlyRevenue] = await Promise.all([
            User.count(),
            Product.count({ where: { is_deleted: false } }),
            Order.count(),
            Order.sum('total_price', {
                where: {
                    createdAt: { [Op.gte]: startOfMonth },
                    status: { [Op.notIn]: ['Cancelled', 'Pending'] }
                }
            })
        ]);

        res.status(200).json({
            totalUsers: totalUsers || 0,
            totalProducts: totalProducts || 0,
            totalOrders: totalOrders || 0,
            monthlyRevenue: monthlyRevenue || 0
        });
    } catch (error) {
        console.error("Error di getMainStats:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI UNTUK PESANAN TERBARU ---
const getRecentOrders = async (req, res) => {
    try {
        const recentOrders = await Order.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: {
                model: User,
                attributes: ['fullName']
            }
        });
        res.status(200).json(recentOrders);
    } catch (error) {
        console.error("Error di getRecentOrders:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI UNTUK PENGGUNA TERBARU ---
const getRecentUsers = async (req, res) => {
    try {
        const recentUsers = await User.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'fullName', 'email', 'createdAt']
        });
        res.status(200).json(recentUsers);
    } catch (error) {
        console.error("Error di getRecentUsers:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI UNTUK PRODUK STOK MENIPIS ---
const getLowStockProducts = async (req, res) => {
    try {
        const lowStockProducts = await ProductVariant.findAll({
            where: { stock: { [Op.lt]: 5 } }, // Stok di bawah 5
            include: {
                model: Product,
                as: 'product',
                attributes: ['id', 'name']
            },
            order: [['stock', 'ASC']]
        });
        res.status(200).json(lowStockProducts);
    } catch (error) {
        console.error("Error di getLowStockProducts:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI UNTUK PRODUK TERLARIS ---
const getTopSellingProducts = async (req, res) => {
    try {
        const topProducts = await Product.findAll({
            limit: 5,
            order: [['sold', 'DESC']],
            attributes: ['id', 'name', 'sold']
        });
        res.status(200).json(topProducts);
    } catch (error) {
        console.error("Error di getTopSellingProducts:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    getMainStats,
    getRecentOrders,
    getRecentUsers,
    getLowStockProducts,
    getTopSellingProducts
};
