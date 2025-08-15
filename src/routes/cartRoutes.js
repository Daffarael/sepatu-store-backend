const express = require('express');
const router = express.Router();

const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem
} = require('../controllers/cartController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(addToCart)
  .get(getCart);

// PERBAIKAN: Ubah `:variantId` menjadi `:productVariantId` agar sesuai dengan controller
router.route('/:productVariantId')
  .put(updateCartItem)
  .delete(removeCartItem);

module.exports = router;