const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const utilities = require('../utilities');

router.get('/', utilities.checkLogin, utilities.handleErrors(favoriteController.buildFavoritesView));
router.post('/add', utilities.checkLogin, utilities.handleErrors(favoriteController.addFavorite));
router.post('/remove', utilities.checkLogin, utilities.handleErrors(favoriteController.removeFavorite));

module.exports = router;
