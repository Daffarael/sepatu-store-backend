const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
    const MASTER_SECRET_CODE = 'MetriKeren';

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

    const secretKey = 'kunci_rahasia_super_aman';
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secretKey,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login berhasil!',
      token: token,
    });

  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// --- FUNGSI 3: FORGOT PASSWORD (DENGAN PERBAIKAN FINAL) ---
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.status(200).json({ message: 'Jika email terdaftar, instruksi reset akan dikirim.' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // --- PERBAIKAN DI SINI: OTOMATIS MEMBUAT AKUN TES ---
    nodemailer.createTestAccount(async (err, account) => {
        if (err) {
            console.error('Gagal membuat akun tes Ethereal:', err);
            return res.status(500).json({ message: 'Gagal membuat akun tes email.' });
        }

        let transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: {
                user: account.user, // Gunakan user dari akun tes
                pass: account.pass, // Gunakan password dari akun tes
            },
        });

        const message = `Anda meminta reset password. Gunakan kode verifikasi ini untuk melanjutkan. Kode ini hanya berlaku 10 menit.\n\nKode Anda: ${resetCode}`;

        const info = await transporter.sendMail({
            from: '"Sepatu Store" <noreply@sepatustore.com>',
            to: user.email,
            subject: 'Kode Reset Password',
            text: message,
        });

        console.log("Email terkirim. URL Preview: %s", nodemailer.getTestMessageUrl(info));
        res.status(200).json({ message: 'Kode reset telah dikirim ke email Anda.' });
    });

  } catch (error) {
    console.error('Error di fungsi forgotPassword:', error);
    res.status(500).json({ message: 'Terjadi kesalahan.' });
  }
};

// --- FUNGSI 4: RESET PASSWORD ---
const resetPassword = async (req, res) => {
    try {
        const { email, code, password, confirmPassword } = req.body;

        if (!email || !code || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Semua field harus diisi.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Password dan Konfirmasi Password tidak cocok.' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Email tidak terdaftar.' });
        }

        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        if (user.resetPasswordToken !== hashedCode || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Kode tidak valid atau sudah kedaluwarsa.' });
        }
        
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
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
  resetPassword,
};