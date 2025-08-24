const { Type, Product } = require('../models'); // Ditambahkan 'Product' untuk pengecekan

// Mendapatkan semua tipe yang statusnya 'Active'
exports.getAllTypes = async (req, res) => {
    try {
        const types = await Type.findAll({
            where: { status: 'Active' },
            order: [['name', 'ASC']]
        });
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data tipe.', error: error.message });
    }
};

// Menambah tipe baru
exports.createType = async (req, res) => {
    try {
        const { name, status } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Nama tipe harus diisi.' });
        }
        const newType = await Type.create({ name, status });
        res.status(201).json({ message: 'Tipe baru berhasil ditambahkan.', type: newType });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nama tipe sudah ada.' });
        }
        res.status(500).json({ message: 'Gagal menambah tipe.', error: error.message });
    }
};

// Mengubah status tipe
exports.updateTypeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ message: "Status harus 'Active' atau 'Inactive'." });
        }

        const type = await Type.findByPk(id);
        if (!type) {
            return res.status(404).json({ message: 'Tipe tidak ditemukan.' });
        }

        type.status = status;
        await type.save();

        res.status(200).json({ message: `Status tipe berhasil diubah menjadi ${status}.`, type });
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengubah status tipe.', error: error.message });
    }
};

// FUNGSI BARU: Update nama tipe
exports.updateType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Nama baru harus diisi.' });
        }

        const type = await Type.findByPk(id);
        if (!type) {
            return res.status(404).json({ message: 'Tipe tidak ditemukan.' });
        }

        type.name = name;
        await type.save();

        res.status(200).json({ message: 'Nama tipe berhasil diperbarui.', type });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nama tipe tersebut sudah digunakan.' });
        }
        res.status(500).json({ message: 'Gagal memperbarui nama tipe.', error: error.message });
    }
};

// FUNGSI BARU: Delete tipe
exports.deleteType = async (req, res) => {
    try {
        const { id } = req.params;

        // PENGAMAN: Cek apakah tipe ini masih digunakan oleh produk
        const productInUse = await Product.findOne({ where: { typeId: id } });
        if (productInUse) {
            return res.status(400).json({ message: 'Tipe ini tidak dapat dihapus karena masih digunakan oleh setidaknya satu produk.' });
        }

        const type = await Type.findByPk(id);
        if (!type) {
            return res.status(404).json({ message: 'Tipe tidak ditemukan.' });
        }

        await type.destroy();

        res.status(200).json({ message: 'Tipe berhasil dihapus.' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus tipe.', error: error.message });
    }
};