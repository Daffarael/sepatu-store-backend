// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware untuk token login utama (dengan log untuk debugging)
const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    // LOG 1: Memeriksa header yang masuk
    console.log('--- Memulai Middleware Protect ---');
    console.log('Header Authorization yang diterima:', authHeader);

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            token = authHeader.split(' ')[1];
            
            // LOG 2: Memeriksa token setelah di-split
            console.log('Token yang diekstrak:', token);

            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            
            // LOG 3: Memeriksa hasil dekode dari token
            console.log('Payload hasil dekode:', decoded);

            const user = await User.findByPk(decoded.userId);
            
            // LOG 4: Memeriksa hasil pencarian user di database
            console.log('User yang ditemukan di DB:', user ? user.toJSON() : 'User Tidak Ditemukan');

            if (!user) {
                return res.status(401).json({ message: 'User dengan token ini tidak ditemukan' });
            }

            req.user = user; // Menambahkan objek user ke request
            console.log('--- Middleware Protect Berhasil, req.user di-set ---');
            next();

        } catch (error) {
            // LOG 5: Menangkap error jika verifikasi gagal
            console.error('!!! ERROR saat verifikasi token:', error.message);
            return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa.', error: error.message });
        }
    } else {
        // LOG 6: Jika tidak ada header Authorization sama sekali
        console.log('Kondisi: Tidak ada token atau format Bearer salah.');
        return res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
    }
};

// Middleware untuk role admin
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak, hanya untuk admin' });
    }
};

// Middleware BARU: Khusus untuk token reset password
const protectReset = (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET_KEY);
            if (decoded.purpose !== 'password-reset') {
                return res.status(401).json({ message: 'Token tidak valid untuk aksi ini' });
            }
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
    }
};

// Middleware BARU: Untuk rute yang bisa diakses oleh user login atau guest
const optionalProtect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const user = await User.findByPk(decoded.userId);
            req.user = user || null;
            next();
        } catch (error) {
            req.user = null;
            next();
        }
    } else {
        req.user = null;
        next();
    }
};

module.exports = { protect, isAdmin, protectReset, optionalProtect };