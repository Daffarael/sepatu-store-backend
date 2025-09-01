// src/controllers/analyticsController.js

const { Order, Product, ProductImage, Type } = require("../models");
const { sequelize } = require('../config/database'); // DITAMBAHKAN: Impor sequelize dari sini
const { Op } = require("sequelize");

// Helper untuk mengubah bulan dari angka ke nama (dalam Bahasa Indonesia)
const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    // 1. Total pendapatan hari ini
    const todayRevenue = await Order.sum("total_price", {
      where: {
        createdAt: { [Op.gte]: startOfDay },
        status: { [Op.notIn]: ["Cancelled", "Pending"] }, // Hanya hitung yang sudah dibayar
      },
    });

    // 2. Total pendapatan bulan ini
    const monthRevenue = await Order.sum("total_price", {
      where: {
        createdAt: { [Op.gte]: startOfMonth },
        status: { [Op.notIn]: ["Cancelled", "Pending"] },
      },
    });

    // 3. Jumlah order yang masih pending
    const pendingOrders = await Order.count({ where: { status: "Pending" } });

    // 4. Grafik penjualan per bulan (12 bulan terakhir)
    const salesByMonth = await Order.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m-01"), "month"],
        [sequelize.fn("SUM", sequelize.col("total_price")), "revenue"],
      ],
      where: { 
        status: { [Op.notIn]: ["Cancelled", "Pending"] },
        createdAt: { [Op.gte]: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) }
      },
      group: ["month"],
      order: [[sequelize.col("month"), "ASC"]],
    });

    const monthlySales = salesByMonth.map((s) => {
      const d = new Date(s.getDataValue("month"));
      return {
        month: monthNames[d.getMonth()],
        revenue: parseInt(s.getDataValue("revenue")),
      };
    });

    // 5. Top 5 produk terlaris
    const topProductsRaw = await Product.findAll({
      order: [["sold", "DESC"]],
      limit: 5,
      include: [
        { model: ProductImage, as: 'images', attributes: ['image_url'], limit: 1 },
        { model: Type, as: 'type', attributes: ['name'] }
      ]
    });

    const topProducts = topProductsRaw.map(product => {
        const productJson = product.toJSON();
        const mainImage = productJson.images && productJson.images.length > 0
            ? productJson.images[0].image_url
            : null;
        return {
            id: productJson.id,
            name: productJson.name,
            type: productJson.type ? productJson.type.name : null,
            sold: productJson.sold,
            image: mainImage
        };
    });

    res.status(200).json({
      todayRevenue: todayRevenue || 0,
      monthRevenue: monthRevenue || 0,
      pendingOrders: pendingOrders || 0,
      monthlySales,
      topProducts,
    });
  } catch (error) {
    console.error("Error di getAnalytics:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

module.exports = { getAnalytics };
