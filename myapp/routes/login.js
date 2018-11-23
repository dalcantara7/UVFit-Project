'use strict';

const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', function (req, res) {
  console.log(__dirname);
  console.log(req.path);
  res.sendFile(path.resolve('./public/login.html'));
});

module.exports = router;