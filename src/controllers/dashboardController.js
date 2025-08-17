// src/controllers/dashboardController.js

const { User, Product, Order } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Fungsi untuk mendapatkan statistik utama dasbor
const getMainStats = async (req, res) => {
    try {
        // 1. Menghitung total pendapatan bulan ini
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const monthlyRevenue = await Order.sum('total_price', {
            where: {
                status: 'Delivered', // Hanya hitung pesanan yang sudah selesai
                createdAt: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            }
        });

        // 2. Menghitung jumlah pengguna terdaftar
        const totalUsers = await User.count();

        // 3. Menghitung total pesanan hari ini
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysOrders = await Order.count({
            where: {
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        // 4. Menghitung jumlah produk aktif
        const activeProducts = await Product.count({
            where: {
                status: 'Active',
                is_deleted: false
            }
        });

        // Kirim semua data sebagai satu objek JSON
        res.status(200).json({
            monthlyRevenue: monthlyRevenue || 0,
            totalUsers: totalUsers || 0,
            todaysOrders: todaysOrders || 0,
            activeProducts: activeProducts || 0
        });

    } catch (error) {
        console.error("Error di getMainStats:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    getMainStats
};