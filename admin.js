const express = require('express');
const { Client } = require('pg');
const json2csv = require('json2csv');

const connectionString = process.env.DATABASE_URL || 'postgres://:@localhost/v2';

const router = express.Router();

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect('/login');
}

async function fetchOrders() {
  const client = new Client({ connectionString });
  await client.connect();
  const result = await client.query('SELECT * FROM orders');
  await client.end();

  return result.rows;
}

router.get('/admin', ensureLoggedIn, async (req, res) => {
  const orders = await fetchOrders();

  res.render('admin', { orders });
});

router.get('/admin/download', async (req, res) => {
  const orders = await fetchOrders();
  json2csv({ data: orders, quotes: '' }, (err, csv) => {
    res.setHeader('Content-disposition', 'attachment; filename=orders.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
  });
});

module.exports = router;
