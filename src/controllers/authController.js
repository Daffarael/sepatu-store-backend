const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');

// --- FUNGSI 1: REGISTER ---
const register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, adminSecretCode } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password dan Konfirmasi Password tidak cocok' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password minimal 8 karakter' });
    }

    let role = 'user';
    const MASTER_SECRET_CODE = process.env.ADMIN_SECRET_CODE;

    if (adminSecretCode) {
      if (adminSecretCode === MASTER_SECRET_CODE) {
        role = 'admin';
      } else {
        return res.status(403).json({ message: 'Admin secret code salah' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role,
    });

    res.status(201).json({
      message: `Registrasi sebagai ${newUser.role} berhasil! 🎉`,
      userId: newUser.id,
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// --- FUNGSI 2: LOGIN ---
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Email tidak ditemukan' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secretKey,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login berhasil!',
      token: token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// --- FUNGSI 3: FORGOT PASSWORD (MENGIRIM KODE) ---
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(200).json({ message: 'Jika email terdaftar, instruksi reset akan dikirim.' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.resetPasswordExpires = Date.now() + 1 * 60 * 1000; // Berlaku 1 menit
    await user.save();

    let transporter = nodemailer.createTransport({
      service: emailConfig.service,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass,
      },
    });

    const message = `Anda meminta reset password. Gunakan kode verifikasi ini untuk melanjutkan. Kode ini hanya berlaku 1 menit.\n\nKode Anda: ${resetCode}`;
    
    await transporter.sendMail({
      from: `"Sepatu Store" <${emailConfig.auth.user}>`,
      to: user.email,
      subject: 'Kode Reset Password',
      text: message,
    });
    
    console.log(`Email reset berhasil dikirim ke: ${user.email}`);
    res.status(200).json({ message: 'Kode reset telah dikirim ke email Anda.' });

  } catch (error) {
    console.error('Error di fungsi forgotPassword:', error);
    res.status(500).json({ message: 'Gagal mengirim email. Periksa konfigurasi .env dan App Password Anda.' });
  }
};

// --- FUNGSI 4: VERIFIKASI KODE ---
const verifyCode = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ message: 'Kode harus diisi.' });
        }

        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedCode,
                resetPasswordExpires: { [require('sequelize').Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Kode tidak valid atau sudah kedaluwarsa.' });
        }
        
        const resetAuthToken = jwt.sign(
            { userId: user.id, purpose: 'password-reset' },
            process.env.JWT_RESET_SECRET_KEY,
            { expiresIn: '5m' }
        );
        
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({
            message: 'Kode berhasil diverifikasi.',
            resetAuthToken: resetAuthToken,
        });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
};

// --- FUNGSI 5: RESET PASSWORD ---
const resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        
        if (!password || !confirmPassword) {
            return res.status(400).json({ message: 'Password baru dan konfirmasi harus diisi.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Password dan Konfirmasi Password tidak cocok.' });
        }

        const userId = req.user.userId;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.status(200).json({ message: 'Password berhasil diubah!' });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan' });
    }
};

// Ekspor semua fungsi
module.exports = {
  register,
  login,
  forgotPassword,
  verifyCode,
  resetPassword,
};