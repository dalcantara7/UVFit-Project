'use strict';

const express = require('express');

const router = express.Router();

router.get('/', function (req, res) {
  let name;

  if (req.query.name) {
    name = req.query.name;
  } else {
    name = 'anonymous';
  }
  res.send('Hi! ' + name);
});

module.exports = router;