'use strict';

const express = require('express');

const router = express.Router();

router.get('/', function (req, res) {
  console.log(__dirname);
  res.sendFile(path.join(__dirname, '/../public/test.html'));
});

module.exports = router;