const express = require('express');

const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

router.get('/admin', ensureLoggedIn, (req, res) => {
  res.render('admin');
});

module.exports = router;
