// src/models/Type.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Type = sequelize.define('Type', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Pastikan setiap nama tipe unik
    },
}, {
    timestamps: false, // Tabel referensi seperti ini biasanya tidak butuh timestamps
});

module.exports = Type;