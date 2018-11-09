'use strict';
var path = require('path');

const express = require('express');

const router = express.Router();

router.get('/', function (req, res) {
  var filePath = path.resolve(__dirname + '/../public/test.html');

  console.log(filePath);
  res.sendFile(filePath);
});

module.exports = router;