const express = require('express');
const router = express.Router();
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// Semua rute di file ini diproteksi, hanya untuk user yang sudah login
router.use(protect);

router.route('/')
    .post(addToWishlist) // POST /api/wishlist -> Menambah item
    .get(getWishlist);    // GET /api/wishlist  -> Melihat wishlist

router.route('/:productId')
    .delete(removeFromWishlist); // DELETE /api/wishlist/1 -> Menghapus item dengan productId 1

module.exports = router;