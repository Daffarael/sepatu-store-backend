const { Type, Product } = require('../models');

// Untuk pengguna biasa: Hanya mengambil tipe yang statusnya 'Active'
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

// FUNGSI BARU: Untuk admin, mengambil SEMUA tipe
exports.getAllTypesForAdmin = async (req, res) => {
    try {
        const types = await Type.findAll({ order: [['name', 'ASC']] });
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil semua data tipe.', error: error.message });
    }
};

// Mengambil satu tipe berdasarkan ID
exports.getTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const type = await Type.findByPk(id);
        if (!type) {
            return res.status(404).json({ message: 'Tipe tidak ditemukan.' });
        }
        res.status(200).json(type);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil data tipe.', error: error.message });
    }
};

// DIPERBARUI: Membuat 'status' menjadi opsional saat create
exports.createType = async (req, res) => {
    try {
        const { name, status } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Nama tipe harus diisi.' });
        }

        const newTypeData = { name };
        // Hanya tambahkan status jika dikirim oleh frontend
        if (status) {
            newTypeData.status = status;
        }
        // Jika tidak, biarkan database menggunakan defaultValue ('Active')

        const newType = await Type.create(newTypeData);
        res.status(201).json({ message: 'Tipe baru berhasil ditambahkan.', type: newType });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nama tipe sudah ada.' });
        }
        res.status(500).json({ message: 'Gagal menambah tipe.', error: error.message });
    }
};

// Fungsi update gabungan (nama dan/atau status)
exports.updateType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, status } = req.body;
        const type = await Type.findByPk(id);
        if (!type) {
            return res.status(404).json({ message: 'Tipe tidak ditemukan.' });
        }
        if (name) {
            type.name = name;
        }
        if (status && ['Active', 'Inactive'].includes(status)) {
            type.status = status;
        }
        await type.save();
        res.status(200).json({ message: 'Tipe berhasil diperbarui.', type });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Nama tipe tersebut sudah digunakan.' });
        }
        res.status(500).json({ message: 'Gagal memperbarui tipe.', error: error.message });
    }
};

// Menghapus tipe
exports.deleteType = async (req, res) => {
    try {
        const { id } = req.params;
        const productInUse = await Product.findOne({ where: { typeId: id } });
        if (productInUse) {
            return res.status(400).json({ message: 'Tipe ini tidak dapat dihapus karena masih digunakan oleh produk.' });
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