// controllers/userController.js

const { User, Order } = require('../models'); // <-- 1. Impor Model 'Order'
const { sequelize } = require('../config/database'); // <-- 2. Impor 'sequelize'
const { Op } = require('sequelize');

// --- FUNGSI UNTUK MENDAPATKAN PROFIL SENDIRI ---
const getUserProfile = (req, res) => {
    const user = req.user;
    res.status(200).json({
        message: 'Data profil berhasil diambil',
        user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        },
    });
};

// --- FUNGSI UNTUK ADMIN MENDAPATKAN SEMUA PENGGUNA (DENGAN TOTAL PESANAN) ---
const getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const users = await User.findAll({
            where: whereClause,
            // --- 3. PERBAIKAN: Tambahkan 'totalOrders' ke attributes ---
            attributes: [
                'id',
                'fullName',
                'email',
                'role',
                'is_blocked',
                'createdAt',
                [sequelize.fn("COUNT", sequelize.col("Orders.id")), "totalOrders"]
            ],
            include: [
                {
                    model: Order,
                    as: 'Orders', // Pastikan alias ini cocok dengan di models/index.js
                    attributes: [] // Tidak perlu mengambil data order, hanya untuk join
                }
            ],
            group: ['User.id'], // Kelompokkan hasil berdasarkan ID pengguna
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Error di getAllUsers:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI BLOCK / UNBLOCK USER ---
const toggleBlockStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        user.is_blocked = !user.is_blocked;
        await user.save();

        const statusMessage = user.is_blocked ? 'diblokir' : 'dibuka blokirnya';
        res.status(200).json({ message: `Pengguna ${user.fullName} berhasil ${statusMessage}.` });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};


// --- FUNGSI BARU: Mendapatkan Detail Satu Pengguna Beserta Riwayat Pesanannya ---
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] }, // Jangan tampilkan password
            include: {
                model: Order,
                as: 'Orders',
                attributes: ['id', 'total_price', 'status', 'createdAt']
            },
            order: [
                [{ model: Order, as: 'Orders' }, 'createdAt', 'DESC']
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error di getUserById:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};


module.exports = {
    getUserProfile,
    getAllUsers,
    toggleBlockStatus,
    getUserById 
};