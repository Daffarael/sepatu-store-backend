// src/models/Review.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1, // Rating minimal 1
            max: 5, // Rating maksimal 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true, // Komentar boleh kosong
    },
    // Kolom userId dan productId akan ditambahkan oleh relasi
}, {
    timestamps: true,
});

module.exports = Review;