const { getUiTexts } = require('../models/ui.model');

function loadUi(keys) {
  return async (req, res, next) => {
    try { res.locals.ui = await getUiTexts(keys); next(); }
    catch (error) { next(error); }
  };
}

module.exports = { loadUi };

