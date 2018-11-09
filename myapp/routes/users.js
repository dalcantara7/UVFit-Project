'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
});

mongoose.connect('mongodb://localhost/mydb');

const User = mongoose.model('User', userSchema);

/* GET users listing. */
router.post('/register', function (req, res, next) {
  bcrypt.hash(req.body.pass, null, null, function (err, hash) {
    const currUser = new User({
      name: req.body.name,
      password: hash,
    });

    currUser.save(function (err, currUser) {
      if (!err) {
        res.send(req.body.name + ' was successfully saved with id ' + currUser._id);
      } else {
        console.log(err);
      }
    });
  });
});

router.get('/', function (req, res, next) {
  res.send('test successful!');
});

module.exports = router;
