const favoriteModel = require('../models/favorite-model');
const invModel = require('../models/inventory-model');
const utilities = require('../utilities');

async function buildFavoritesView(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const activeAccount = res.locals.accountData || req.session.accountData;
    const favorites = await favoriteModel.getFavoritesByAccountId(activeAccount.account_id);

    res.render('account/favorites', {
      title: 'Saved Vehicles',
      nav,
      favorites,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

async function addFavorite(req, res, next) {
  try {
    const activeAccount = res.locals.accountData || req.session.accountData;
    const inv_id = Number(req.body.inv_id);
    const vehicle = await invModel.getInventoryItemById(inv_id);

    if (!vehicle) {
      req.flash('notice', 'That vehicle could not be found.');
      return res.redirect('/');
    }

    const alreadySaved = await favoriteModel.checkFavorite(activeAccount.account_id, inv_id);
    if (alreadySaved) {
      req.flash('notice', 'That vehicle is already in your saved list.');
      return res.redirect(`/inv/detail/${inv_id}`);
    }

    await favoriteModel.addFavorite(activeAccount.account_id, inv_id);
    req.flash('notice', `${vehicle.inv_make} ${vehicle.inv_model} was added to your saved vehicles.`);
    return res.redirect('/favorites');
  } catch (error) {
    next(error);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const activeAccount = res.locals.accountData || req.session.accountData;
    const inv_id = Number(req.body.inv_id);
    const removed = await favoriteModel.removeFavorite(activeAccount.account_id, inv_id);

    if (removed) {
      req.flash('notice', 'Vehicle removed from your saved list.');
    } else {
      req.flash('notice', 'Saved vehicle not found.');
    }

    const returnTo = req.body.return_to === 'detail' ? `/inv/detail/${inv_id}` : '/favorites';
    return res.redirect(returnTo);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildFavoritesView,
  addFavorite,
  removeFavorite,
};
