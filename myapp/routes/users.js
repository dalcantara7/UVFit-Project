'use strict';

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
});

mongoose.connect('mongodb://localhost/mydb');

const User = mongoose.model('User', userSchema);


/* GET users listing. */
router.post('/register', function (req, res, next) {
  const currUser = new User({
    name: req.body.name,
    password: req.body.pass,
  });

  currUser.save(function (err, currUser) {
    if (!err) {
      res.send(req.body.name + ' was successfully saved with id ' + currUser._id);
    } else {
      console.log(err);
    }
  });
});

router.get('/', function (req, res, next) {
  console.log('connected to users route');
  res.send('test successful!');
});

module.exports = router;
