// controllers/productController.js

const { Product, ProductImage, ProductVariant, Type } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Fungsi bantuan untuk mengurai JSON dengan aman
const safeParseJSON = (jsonString) => {
    try {
        if (jsonString) {
            return JSON.parse(jsonString);
        }
        return null;
    } catch (e) {
        console.error('Gagal mengurai JSON:', e.message);
        return null;
    }
};

// --- FUNGSI CREATE PRODUCT ---
const createProduct = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            brand, name, description, price, variants, typeId, category,
            color, 'Material Atas': materialAtas, 'Material Sol': materialSol, 'Kode SKU': kodeSKU
        } = req.body;

        if (!brand || !name || !price || !typeId) {
            await t.rollback();
            return res.status(400).json({ message: 'Brand, nama, harga, dan typeId harus diisi.' });
        }
        const parsedVariants = variants ? safeParseJSON(variants) : null;
        if (!parsedVariants || !Array.isArray(parsedVariants) || parsedVariants.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Varian produk (ukuran/stok) harus diisi.' });
        }
        const specificationsObject = {
            Warna: color || null,
            "Material Atas": materialAtas || null,
            "Material Sol": materialSol || null,
            "Kode SKU": kodeSKU || null
        };
        const newProduct = await Product.create({
            brand, name, description, price,
            category: category,
            typeId: typeId,
            specifications: specificationsObject,
        }, { transaction: t });
        
        const variantData = parsedVariants.map(v => ({
            size: v.size, stock: v.stock, productId: newProduct.id,
        }));
        await ProductVariant.bulkCreate(variantData, { transaction: t });

        if (req.files && req.files.length > 0) {
            const images = req.files.map(file => ({
                image_url: file.path.replace(/\\/g, '/'),
                productId: newProduct.id,
            }));
            await ProductImage.bulkCreate(images, { transaction: t });
        }

        await t.commit();
        const createdProductWithDetails = await Product.findByPk(newProduct.id, {
            include: [
                { model: ProductVariant, as: 'variants' },
                { model: ProductImage, as: 'images' },
                { model: Type, as: 'type' }
            ]
        });
        res.status(201).json({
            message: 'Produk dengan varian berhasil dibuat',
            product: createdProductWithDetails,
        });
    } catch (error) {
        await t.rollback();
        console.error('Error saat membuat produk:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI GET ALL PRODUCTS ---
const getAllProducts = async (req, res) => {
    try {
        const { search, category, typeId, minPrice, maxPrice, rating, sortBy, order, page, limit } = req.query;
        const whereClause = { is_deleted: false, status: 'Active' };

        if (search) { whereClause.name = { [Op.like]: `%${search}%` }; }
        if (category) { whereClause.category = category; }
        if (typeId) { whereClause.typeId = typeId; }
        if (minPrice && maxPrice) { whereClause.price = { [Op.between]: [parseInt(minPrice), parseInt(maxPrice)] }; }
        if (rating) { whereClause.rating = { [Op.gte]: parseFloat(rating) }; }
        
        const includeType = {
            model: Type,
            as: 'type',
            attributes: ['name'],
        };

        // Hanya sertakan produk yang tipenya aktif
        if (req.user && req.user.role === 'admin') {
            // Admin bisa melihat semua, tidak perlu filter status tipe
        } else {
            includeType.where = { status: 'Active' };
            includeType.required = true;
        }

        const orderClause = sortBy && order ? [[sortBy, order.toUpperCase()]] : [['createdAt', 'DESC']];
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        const offset = (pageNum - 1) * limitNum;

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: [
                { model: ProductImage, as: 'images', attributes: ['image_url'], limit: 1 },
                includeType
            ],
            order: orderClause,
            limit: limitNum,
            offset: offset,
            distinct: true,
        });

        const formattedProducts = rows.map(product => {
            const productJson = product.toJSON();
            const mainImage = productJson.images && productJson.images.length > 0
                ? `${process.env.BASE_URL}/${productJson.images[0].image_url}`
                : null;
            return {
                id: productJson.id,
                brand: productJson.brand,
                name: productJson.name,
                price: productJson.price,
                rating: productJson.rating,
                image: mainImage,
                type: productJson.type
            };
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limitNum),
            currentPage: pageNum,
            products: formattedProducts,
        });
    } catch (error) {
        console.error('Error saat mendapatkan semua produk:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI GET PRODUCT BY ID ---
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: { id: id, is_deleted: false },
            include: [
                { model: ProductImage, as: 'images', attributes: ['image_url'] },
                { model: ProductVariant, as: 'variants', attributes: ['id', 'size', 'stock'] },
                { model: Type, as: 'type', attributes: ['id', 'name'] }
            ],
        });
        if (!product) {
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }
        
        const productJson = product.toJSON();
        const formattedResponse = {
            id: productJson.id,
            brand: productJson.brand,
            name: productJson.name,
            price: productJson.price,
            category: productJson.category,
            rating: productJson.rating,
            reviewCount: productJson.reviewCount,
            sold: productJson.sold,
            description: productJson.description,
            type: productJson.type,
            imageGallery: productJson.images.map(img => `${process.env.BASE_URL}/${img.image_url}`),
            specifications: productJson.specifications,
            sizes: productJson.variants.map(v => ({
                variantId: v.id, size: v.size, stock: v.stock,
            })),
        };
        res.status(200).json(formattedResponse);
    } catch (error) {
        console.error('Error saat mendapatkan produk berdasarkan ID:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI UPDATE PRODUCT ---
const updateProduct = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { brand, name, description, price, category, typeId, specifications, variants, status } = req.body;
        const product = await Product.findByPk(id, { transaction: t });
        if (!product) {
            await t.rollback();
            return res.status(404).json({ message: 'Produk tidak ditemukan.' });
        }
        
        product.brand = brand || product.brand;
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.typeId = typeId || product.typeId;
        product.specifications = specifications ? safeParseJSON(specifications) : product.specifications;
        product.status = status || product.status;
        
        await product.save({ transaction: t });

        if (variants) {
            const parsedVariants = safeParseJSON(variants);
            if (parsedVariants) {
                await ProductVariant.destroy({ where: { productId: id }, transaction: t });
                const variantData = parsedVariants.map(v => ({
                    size: v.size, stock: v.stock, productId: id,
                }));
                await ProductVariant.bulkCreate(variantData, { transaction: t });
            }
        }

        if (req.files && req.files.length > 0) {
            await ProductImage.destroy({ where: { productId: id }, transaction: t });
            const newImages = req.files.map(file => ({
                image_url: file.path.replace(/\\/g, '/'),
                productId: id,
            }));
            await ProductImage.bulkCreate(newImages, { transaction: t });
        }

        await t.commit();
        res.status(200).json({ message: 'Produk berhasil diperbarui' });
    } catch (error) {
        await t.rollback();
        console.error('Error saat memperbarui produk:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

// --- FUNGSI SOFT DELETE PRODUCT ---
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
        console.error('Error saat menghapus produk:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};