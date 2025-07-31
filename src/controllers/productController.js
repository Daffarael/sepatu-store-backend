const { Product, ProductImage } = require('../models'); // Impor dari index.js

// Fungsi untuk membuat produk baru (khusus admin)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, status } = req.body;

    if (!name || !price || !stock || !category) {
        return res.status(400).json({ message: 'Nama, harga, stok, dan kategori harus diisi.' });
    }

    // Buat produk utama terlebih dahulu
    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      status: status || 'Active', // Default ke 'Active' jika tidak diisi
    });

    // Proses multiple images jika ada file yang di-upload
    // req.files (plural) adalah array yang berisi semua file gambar
    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => ({
        image_url: file.path,
        productId: newProduct.id, // Hubungkan setiap gambar dengan ID produk yang baru dibuat
      }));
      
      // Simpan semua data gambar ke tabel ProductImage sekaligus
      await ProductImage.bulkCreate(images);
    }

    res.status(201).json({
      message: 'Produk berhasil dibuat',
      product: newProduct,
    });

  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

module.exports = {
  createProduct,
};