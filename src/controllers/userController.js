const User = require('../models/User');

// --- FUNGSI UNTUK MENDAPATKAN PROFIL SENDIRI (DIPERBAIKI) ---
const getUserProfile = (req, res) => {
  // req.user sudah berisi data pengguna lengkap dari middleware 'protect'
  const user = req.user;

  // Kirim kembali data pengguna yang relevan, pastikan password tidak ikut terkirim
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

// --- FUNGSI UNTUK ADMIN MENDAPATKAN SEMUA PENGGUNA ---
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'fullName', 'email', 'role', 'createdAt'], // Ditambahkan 'createdAt' untuk tanggal bergabung
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = {
  getUserProfile,
  getAllUsers,
};