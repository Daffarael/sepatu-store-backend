const { Product, ProductImage } = require('../models');
const { Op } = require('sequelize'); // Impor operator Sequelize

// --- FUNGSI CREATE PRODUCT ---
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, status } = req.body;

    if (!name || !price || !stock || !category) {
        return res.status(400).json({ message: 'Nama, harga, stok, dan kategori harus diisi.' });
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      status: status || 'Active',
    });

    if (req.files && req.files.length > 0) {
      const images = req.files.map(file => ({
        image_url: file.path,
        productId: newProduct.id,
      }));
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

// --- FUNGSI MENAMPILKAN SEMUA PRODUK (DENGAN SEARCH, FILTER, SORT, PAGINATION) ---
const getAllProducts = async (req, res) => {
    try {
        const { search, category, sortBy, order, page, limit } = req.query;

        // 1. Filter & Search
        const whereClause = {
            is_deleted: false,
            status: 'Active'
        };
        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }
        if (category) {
            whereClause.category = category;
        }

        // 2. Sort
        const orderClause = [];
        if (sortBy && order) {
            orderClause.push([sortBy, order.toUpperCase()]);
        } else {
            orderClause.push(['createdAt', 'DESC']); // Default sort
        }

        // 3. Pagination
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        // Eksekusi query dengan semua opsi
        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'image_url'],
            },
            order: orderClause,
            limit: limitNum,
            offset: offset,
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum,
            products: rows
        });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI MENAMPILKAN SATU PRODUK BERDASARKAN ID ---
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: {
                id: id,
                is_deleted: false,
                status: 'Active'
            },
            include: {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'image_url'],
            }
        });

        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI UPDATE PRODUK ---
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, category, status } = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.stock = stock || product.stock;
        product.category = category || product.category;
        product.status = status || product.status;

        await product.save();

        res.status(200).json({
            message: 'Produk berhasil diperbarui',
            product: product
        });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI SOFT DELETE PRODUK ---
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }

        product.is_deleted = true;
        await product.save();

        res.status(200).json({ message: 'Produk berhasil dihapus (soft delete).' });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// Ekspor semua fungsi
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};