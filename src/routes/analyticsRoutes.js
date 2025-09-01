// src/routes/analyticsRoutes.js

const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Endpoint ini hanya bisa diakses oleh admin yang sudah login
router.get("/", protect, isAdmin, getAnalytics);

module.exports = router;
