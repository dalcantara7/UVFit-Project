'use strict';

const express = require('express');
const path = require('path');

const router = express.Router();

/**
 * gets the login page page for the site
 */
router.get('/', function (req, res) {
  res.sendFile(path.resolve('./public/login.html'));
});

module.exports = router;