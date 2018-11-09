'use strict';

const express = require('express');

const router = express.Router();

router.get('/', function (req, res) {
  console.log(__dirname + '/../public/test.html');
  res.sendFile(__dirname + '/../public/test.html');
});

module.exports = router;