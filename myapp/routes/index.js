'use strict';

const express = require('express');
const path = require('path');
const exec = require('child_process').exec;

const router = express.Router();

router.get('/', function (req, res) {
  res.sendFile(path.resolve('./public/index.html'));
});

module.exports = router;
