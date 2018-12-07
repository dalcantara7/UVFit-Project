'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const sanitize = require('mongo-sanitize');
const jwt = require('jwt-simple');
const path = require('path');
const User = require('../models/users');
const Device = require('../models/devices');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

const secret = 'testsecretkey';

router.get('/register', function (req, res, next) {
  res.sendFile(path.resolve('./public/registerUser.html'));
});

router.get('/dashboard', function (req, res, next) {
  res.sendFile(path.resolve('./public/userDashboard.html'));
});

router.post('/register', function (req, res) {
  User.findOne({ email: sanitize(req.body.email) }, function (err, user) {
    if (user) {
      res.json({ success: false, message: 'Email already in use' });
    } else {
      bcrypt.hash(req.body.password, null, null, function (err, hash) {
        const currUser = new User({
          email: req.body.email,
          username: req.body.username,
          password: hash,
        });

        currUser.save(function (err, currUser) {
          if (err) throw err;
        });
      });

      res.json({ success: true, message: 'Successfully registered' });
    }
  });
});

router.post('/auth', function (req, res, next) {
  User.findOne({ email: sanitize(req.body.email) }, function (err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).json({ error: 'Bad email' });
    } else {
      bcrypt.compare(req.body.password, user.password, function (err, valid) {
        if (err) {
          res.status(400).json({ error: err });
        } else if (valid) {
          const token = jwt.encode({ userEmail: user.email }, secret);
          res.json({ token: token, username: user.username });
        } else {
          res.status(401).json({ error: 'Bad password' });
        }
      });
    }
  });
});

router.get('/events', function (req, res, next) {
  res.sendFile(path.resolve('./public/viewEvents.html'));
});

router.get('/getdevices', function (req, res) {
  let userEmail;
  const responseJSON = {
    success: false,
    devices: [],
  };

  // authentication check
  if (req.headers.x_auth) {
    try {
      const token = req.headers.x_auth;
      userEmail = jwt.decode(token, secret).userEmail;
    } catch (ex) {
      responseJSON.message = 'Invalid authorization token.';
      responseJSON.success = false;
      res.status(401).json(responseJSON);
    }
  } else {
    responseJSON.message = 'Missing authorization token.';
    responseJSON.success = false;

    res.status(401).json(responseJSON);
  }

  Device.find({ userEmail: sanitize(userEmail) }, function (err, devices) {
    if (err) throw err;

    for (const device of devices) {
      responseJSON.devices.push(device.deviceID);
    }

    responseJSON.success = true;
  });

  res.status(200).json(responseJSON);
});

module.exports = router;