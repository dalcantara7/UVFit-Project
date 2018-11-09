'use strict';

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

mongoose.connect('mongodb://localhost/mydb');

/* GET users listing. */
router.post('/register', function (req, res, next) {

});

router.get('/', function (req, res, next) {
  res.send('test successful!');
});

module.exports = router;
