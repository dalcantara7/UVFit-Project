'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/users');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

/* GET users listing. */
router.post('/register', function (req, res) {
  bcrypt.hash(req.body.password, null, null, function (err, hash) {
    const currUser = new User({
      email: req.body.email,
      username: req.body.username,
      password: hash,
    });

    currUser.save(function (err, currUser) {
      if (err) throw err;

      res.send(req.body.username + ' was successfully saved with id ' + currUser._id);
    });
  });
});

router.post('/auth', function (req, res, next) {
  User.findOne({ username: req.body.username, email: req.body.email }, function (err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).json({ error: 'Bad username or email' });
    } else {
      bcrypt.compare(req.body.password, user.password, function (err, valid) {
        if (err) {
          res.status(400).json({ error: err });
        } else if (valid) {
          res.send('Successful authentication!');
        } else {
          res.status(401).json({ error: 'Bad password' });
        }
      });
    }
  });
});

router.get('/', function (req, res) {
  res.send('successfully accessed USERS route');
});

module.exports = router;