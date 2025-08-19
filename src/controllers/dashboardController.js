// src/controllers/dashboardController.js

const { User, Product, Order, ProductVariant } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// (Fungsi getMainStats dan getRecentOrders tetap sama)
const getMainStats = async (req, res) => { /* ... */ };
const getRecentOrders = async (req, res) => { /* ... */ };


// --- FUNGSI GET RECENT USERS (DIPERBARUI) ---
const getRecentUsers = async (req, res) => {
    try {
        const recentUsers = await User.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            // --- PERBAIKAN: Tambahkan 'id' ke dalam attributes ---
            attributes: ['id', 'fullName', 'email', 'createdAt'] 
        });

        res.status(200).json(recentUsers);
    } catch (error) {
        console.error("Error di getRecentUsers:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// (Fungsi getLowStockProducts dan getTopSellingProducts tetap sama)
const getLowStockProducts = async (req, res) => { /* ... */ };
const getTopSellingProducts = async (req, res) => { /* ... */ };


module.exports = {
    getMainStats,
    getRecentOrders,
    getRecentUsers,
    getLowStockProducts,
    getTopSellingProducts
};