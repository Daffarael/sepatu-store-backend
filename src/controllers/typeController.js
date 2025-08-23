const { Type } = require('../models');

// Mendapatkan semua tipe
exports.getAllTypes = async (req, res) => {
    try {
        const types = await Type.findAll({ order: [['name', 'ASC']] });
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data tipe.', error: error.message });
    }
};

// Menambah tipe baru (khusus admin)
exports.createType = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Nama tipe harus diisi.' });
        }
        const newType = await Type.create({ name });
        res.status(201).json({ message: 'Tipe baru berhasil ditambahkan.', type: newType });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nama tipe sudah ada.' });
        }
        res.status(500).json({ message: 'Gagal menambah tipe.', error: error.message });
    }
};