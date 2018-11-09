'use strict';

const express = require('express');

const router = express.Router();

router.get('/', function (req, res) {
  res.sendFile('../public/test.html');
});

module.exports = router;