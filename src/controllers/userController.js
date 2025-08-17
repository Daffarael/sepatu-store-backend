// controllers/userController.js

const { User } = require('../models');
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

// --- FUNGSI UNTUK ADMIN MENDAPATKAN SEMUA PENGGUNA (DENGAN PENCARIAN) ---
const getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } }, // Cari di nama lengkap
                { email: { [Op.like]: `%${search}%` } }      // Cari di email
            ];
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: ['id', 'fullName', 'email', 'role', 'is_blocked', 'createdAt'], // Ditambahkan is_blocked
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI BARU: BLOCK / UNBLOCK USER ---
const toggleBlockStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        // Ubah status blokir
        user.is_blocked = !user.is_blocked;
        await user.save();

        const statusMessage = user.is_blocked ? 'diblokir' : 'dibuka blokirnya';
        res.status(200).json({ message: `Pengguna ${user.fullName} berhasil ${statusMessage}.` });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI BARU: UPDATE ROLE USER ---
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || (role !== 'user' && role !== 'admin')) {
            return res.status(400).json({ message: "Peran tidak valid. Gunakan 'user' atau 'admin'." });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        user.role = role;
        await user.save();

        res.status(200).json({ message: `Peran pengguna ${user.fullName} berhasil diubah menjadi ${role}.` });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    getUserProfile,
    getAllUsers,
    toggleBlockStatus,
    updateUserRole
};