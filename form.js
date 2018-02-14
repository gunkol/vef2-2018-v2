const express = require('express');

const router = express.Router();

function form(req, res) {
  const data = { };
  res.render('form', { data });
}

router.get('/', form);

module.exports = router;
