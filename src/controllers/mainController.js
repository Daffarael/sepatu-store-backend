// Ini adalah fungsi yang akan menangani logika untuk halaman utama
const getHomepage = (req, res) => {
  res.send('Pesan ini datang dari Controller!');
};

// Ekspor fungsi ini agar bisa digunakan oleh file rute
module.exports = {
  getHomepage,
};