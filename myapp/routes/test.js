'use strict';

const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', function (req, res) {
  res.sendFile(path.resolve('../public/test.html'));
});

module.exports = router;