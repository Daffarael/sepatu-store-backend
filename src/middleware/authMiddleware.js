const jwt = require('jsonwebtoken');

// Middleware untuk memeriksa apakah user sudah login (punya token valid)
const protect = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const secretKey = 'kunci_rahasia_super_aman';
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token tidak valid' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
  }
};

// Middleware untuk memeriksa apakah user adalah admin (BARU)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Lanjutkan jika user adalah admin
  } else {
    res.status(403).json({ message: 'Akses ditolak, hanya untuk admin' });
  }
};

module.exports = { protect, isAdmin };