// src/controllers/addressController.js

const { Address, User } = require('../models');
const { sequelize } = require('../config/database');

// Menambah alamat baru
const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipientName, phoneNumber, streetAddress, village, district, city, province, isPrimary } = req.body;

        if (!recipientName || !phoneNumber || !streetAddress || !city || !province) {
            return res.status(400).json({ message: 'Nama, nomor telepon, alamat jalan, kota, dan provinsi harus diisi.' });
        }

        // Jika alamat baru ini adalah utama, nonaktifkan yang lain
        if (isPrimary) {
            await Address.update({ isPrimary: false }, { where: { userId } });
        }

        const newAddress = await Address.create({
            userId,
            recipientName,
            phoneNumber,
            streetAddress,
            village,
            district,
            city,
            province,
            isPrimary: isPrimary || false
        });

        res.status(201).json({ message: 'Alamat berhasil ditambahkan.', address: newAddress });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Mendapatkan semua alamat milik pengguna
const getAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await Address.findAll({ where: { userId } });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Memperbarui alamat
const updateAddress = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const { addressId } = req.params;
        const { recipientName, phoneNumber, streetAddress, village, district, city, province, isPrimary } = req.body;

        const address = await Address.findOne({ where: { id: addressId, userId: userId } });
        if (!address) {
            await t.rollback();
            return res.status(404).json({ message: 'Alamat tidak ditemukan.' });
        }

        // Jika alamat ini akan dijadikan utama, nonaktifkan yang lain dulu
        if (isPrimary) {
            await Address.update({ isPrimary: false }, { where: { userId }, transaction: t });
        }
        
        // Perbarui field yang ada di body
        address.recipientName = recipientName || address.recipientName;
        address.phoneNumber = phoneNumber || address.phoneNumber;
        address.streetAddress = streetAddress || address.streetAddress;
        address.village = village || address.village;
        address.district = district || address.district;
        address.city = city || address.city;
        address.province = province || address.province;
        // Hanya update isPrimary jika nilainya secara eksplisit dikirim (true atau false)
        if (isPrimary !== undefined) {
            address.isPrimary = isPrimary;
        }

        await address.save({ transaction: t });
        await t.commit();
        res.status(200).json({ message: 'Alamat berhasil diperbarui.', address });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Menghapus alamat
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const address = await Address.findOne({ where: { id: addressId, userId: userId } });
        if (!address) {
            return res.status(404).json({ message: 'Alamat tidak ditemukan.' });
        }

        await address.destroy();
        res.status(200).json({ message: 'Alamat berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Menjadikan alamat sebagai alamat utama
const setPrimaryAddress = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        // 1. Nonaktifkan semua alamat utama yang lain
        await Address.update({ isPrimary: false }, { where: { userId }, transaction: t });

        // 2. Aktifkan alamat yang dipilih sebagai utama
        const [updatedRows] = await Address.update({ isPrimary: true }, { where: { id: addressId, userId: userId }, transaction: t });

        if (updatedRows === 0) {
            await t.rollback();
            return res.status(404).json({ message: 'Alamat tidak ditemukan.' });
        }

        await t.commit();
        res.status(200).json({ message: 'Alamat utama berhasil diubah.' });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};


module.exports = {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setPrimaryAddress
};