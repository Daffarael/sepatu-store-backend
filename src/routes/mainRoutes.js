const express = require('express');
const router = express.Router();
// Impor controller yang sudah kita buat
const mainController = require('../controllers/mainController');

// Arahkan rute '/' untuk menjalankan fungsi getHomepage dari mainController
router.get('/', mainController.getHomepage);

module.exports = router;