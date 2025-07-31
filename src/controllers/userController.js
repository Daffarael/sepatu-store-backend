const User = require('../models/User');

// Fungsi untuk mendapatkan profil sendiri
const getUserProfile = (req, res) => {
  res.status(200).json({
    message: 'Data profil berhasil diambil',
    user: {
      userId: req.user.userId,
      role: req.user.role,
    },
  });
};

// Fungsi untuk mendapatkan semua pengguna (khusus admin) (BARU)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'fullName', 'email', 'role'], // Hanya tampilkan data ini
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