const { Client } = require('pg');
const xss = require('xss');
const { check, validationResult } = require('express-validator/check');

const connectionString = process.env.DATABASE_URL || 'postgres://:@localhost/v2';

const express = require('express');

const router = express.Router();

function form(req, res) {
  if (req.isAuthenticated()) {
    const userdata = req.user;
    return res.render('form', { userdata });
  }
  return res.render('form');
}

async function addOrder(name, email, amount, ssn) {
  const client = new Client({ connectionString });
  await client.connect();
  const query = 'INSERT INTO orders(name, email, amount, ssn) VALUES ($1, $2, $3, $4)';
  const values = [name, email, amount, ssn];
  await client.query(query, values);
  await client.end();
}

router.post(
  '/',
  check('name').isLength({ min: 1 }).withMessage('Nafn má ekki vera tómt'),
  check('email').isLength({ min: 1 }).withMessage('Netfang má ekki vera tómt'),
  check('email').isEmail().withMessage('Netfang verður að vera netfang'),
  check('ssn').isLength({ min: 1 }).withMessage('Kennitala má ekki vera tóm'),
  check('ssn').matches(/^[0-9]{6}-?[0-9]{4}$/).withMessage('Kennitala verður að vera á formi 000000-0000'),
  check('amount').isLength({ min: 1 }).withMessage('Fjöldi má ekki vera tómur'),
  check('amount').isInt({ min: 1 }).withMessage('Fjöldi verður að vera tala, stærri en 0'),

  async (req, res) => {
    const {
      name = '',
      email = '',
      ssn = '',
      amount = '',
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(i => i.msg);
      if (req.isAuthenticated()) {
        const userdata = req.user;

        return res.render('form', {
          userdata, errorMessages, name, email, ssn, amount,
        });
      }

      return res.render('form', {
        errorMessages, name, email, ssn, amount,
      });
    }

    await addOrder(xss(name), xss(email), xss(amount), xss(ssn));

    return res.redirect('/thanks');
  },
);

router.get('/', form);
router.get('/thanks', (req, res) => {
  res.render('thanks');
});

module.exports = router;
