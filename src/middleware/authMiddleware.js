const jwt = require('jsonwebtoken');

// Middleware untuk token login utama (tetap sama)
const protect = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
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

// Middleware untuk role admin (tetap sama)
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
        
        // Memastikan token ini memang untuk tujuan reset password
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

module.exports = { protect, isAdmin, protectReset };