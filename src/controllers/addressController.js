// src/controllers/addressController.js

const { Address } = require('../models');

// --- FUNGSI DIPERBARUI: Mendapatkan satu alamat milik pengguna ---
const getMyAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        // Cari satu alamat yang dimiliki oleh pengguna
        const address = await Address.findOne({ where: { userId } });

        if (!address) {
            // Jika tidak ada alamat, kirim 404 Not Found
            return res.status(404).json({ message: 'Alamat tidak ditemukan.' });
        }

        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI DIPERBARUI: Menambah alamat baru (hanya jika belum ada) ---
const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        // Cek apakah pengguna sudah memiliki alamat
        const existingAddress = await Address.findOne({ where: { userId } });
        if (existingAddress) {
            return res.status(400).json({ 
                message: 'Anda sudah memiliki alamat. Silakan gunakan metode PUT untuk memperbarui.' 
            });
        }

        const {
            recipientName, phoneNumber, province, city,
            district, village, streetAddress, details
        } = req.body;

        const newAddress = await Address.create({
            userId, recipientName, phoneNumber, province, city,
            district, village, streetAddress, details
        });

        res.status(201).json({ message: 'Alamat baru berhasil ditambahkan.', address: newAddress });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI DIPERBARUI: Memperbarui alamat yang sudah ada ---
const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Cari alamat berdasarkan userId, bukan addressId, karena pengguna hanya punya satu
        const address = await Address.findOne({ where: { userId } });

        if (!address) {
            return res.status(404).json({ message: 'Alamat tidak ditemukan untuk diperbarui.' });
        }

        await address.update(req.body);

        res.status(200).json({ message: 'Alamat berhasil diperbarui.', address: address });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI DIPERBARUI: Menghapus alamat yang sudah ada ---
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        // Hapus alamat berdasarkan userId
        const result = await Address.destroy({ where: { userId } });

        if (result === 0) {
            return res.status(404).json({ message: 'Alamat tidak ditemukan untuk dihapus.' });
        }

        res.status(200).json({ message: 'Alamat berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    getMyAddress,
    addAddress,
    updateAddress,
    deleteAddress
};