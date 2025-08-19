// src/models/Address.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Address = sequelize.define('Address', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    recipientName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    province: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    district: { // Kecamatan
        type: DataTypes.STRING,
        allowNull: false,
    },
    village: { // Kelurahan
        type: DataTypes.STRING,
        allowNull: false,
    },
    streetAddress: { // Nama Jalan, No Rumah
        type: DataTypes.TEXT,
        allowNull: false,
    },
    details: { // Detail lainnya
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // userId akan ditambahkan oleh relasi
}, {
    timestamps: true,
});

module.exports = Address;