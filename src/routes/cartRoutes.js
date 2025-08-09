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

router.route('/:productId')
    .put(updateCartItem)
    .delete(removeCartItem);

module.exports = router;