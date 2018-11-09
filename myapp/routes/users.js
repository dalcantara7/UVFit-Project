'use strict';

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

mongoose.connect('mongodb://localhost/mydb');

const User = mongoose.model('User', userSchema);

/* GET users listing. */
router.post('/register', function (req, res) {
  bcrypt.hash(req.body.pass, null, null, function (err, hash) {
    const currUser = new User({
      username: req.body.name,
      password: hash,
    });

    currUser.save(function (err, currUser) {
      if (err) throw err;

      res.send(req.body.name + ' was successfully saved with id ' + currUser._id);
    });
  });
});

router.post('/auth', function (req, res, next) {
  User.findOne({ username: req.body.username }, function (err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).json({ error: 'Bad username' });
    } else {
      bcrypt.compare(req.body.pass, user.password, function (err, valid) {
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
  res.send('successfully accessed users route');
});


module.exports = router;
