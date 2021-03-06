'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const sanitize = require('mongo-sanitize');
const jwt = require('jwt-simple');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/users');
const Device = require('../models/devices');

const router = express.Router();
router.use(bodyParser.urlencoded({ extended: false }));

const secret = fs.readFileSync(path.resolve(__dirname, '../jwtkey.txt')).toString();

/**
 *  returns the page for registering a user
 */
router.get('/register', function (req, res, next) {
  res.sendFile(path.resolve('./public/registerUser.html'));
});

/**
 *  returns the page for the user dashboard
 */
router.get('/dashboard', function (req, res, next) {
  res.sendFile(path.resolve('./public/userDashboard.html'));
});

/**
 *  post route for registering a user, takes in a username, password, and email
 *  sends an email to the users registered email with a hash to verify email
 *  returns a success bool and a message
 */
router.post('/register', function (req, res) {
  User.findOne({ email: sanitize(req.body.email) }, function (err, user) {
    if (user) {
      res.json({ success: false, message: 'Email already in use' });
    } else {
      bcrypt.hash(req.body.password, null, null, function (err, hash) {
        const verificationHash = crypto.randomBytes(20).toString('hex');
        const currUser = new User({
          email: req.body.email,
          username: req.body.username,
          password: hash,
          verHash: verificationHash,
        });

        currUser.save(function (err, user) {
          if (err) throw err;

          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: '513UVFitProject@gmail.com',
              pass: 'HeyThisHereIsAPassword123!',
            },
          });

          const mailOptions = {
            from: '513UVFitProject@gmail.com',
            to: user.email,
            subject: 'Please verify your email for UV-Fit',
            text: 'https://www.evanweiler.com:3443/users/verify?hash=' + verificationHash,
          };

          transporter.sendMail(mailOptions, function (err, info) {
            if (err) throw err;
          });
        });
      });

      res.json({ success: true, message: 'Successfully registered, please see your email to verify your email' });
    }
  });
});

/**
 *  get endpoint for user email verification. takes in a single query parameter, the hash
 *  returns a plaintext message
 */
router.get('/verify', function (req, res) {
  const verHash = sanitize(req.query.hash);

  User.findOne({ verHash: verHash }, function (err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).send('ERROR: User with specified verification link does not exist');
    } else {
      user.isActive = true;

      user.save(function (err, user) {
        if (err) throw err;

        res.send('Successfully activated account!');
      });
    }
  });
});

/**
 *  route to authenticate the user for when they login
 */
router.post('/auth', function (req, res, next) {
  User.findOne({ email: sanitize(req.body.email) }, function (err, user) {
    if (err) throw err;

    if (!user) {
      res.status(401).json({ error: 'Bad email' });
    } else if (!user.isActive) {
      res.status(401).json({ error: 'Email not yet verified' });
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

/**
 *  route to receive the activities page for the user
 */
router.get('/activities', function (req, res, next) {
  res.sendFile(path.resolve('./public/viewActivities.html'));
});

/**
 *  route to get all devices for the associated user
 *  returns a success bool and devices array
 */
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
      responseJSON.devices.push(device);
    }

    responseJSON.success = true;

    res.status(200).json(responseJSON);
  });
});

/**
 *  gets the page for the user preferences
 */
router.get('/preferences', function (req, res) {
  res.sendFile(path.resolve('./public/userPrefs.html'));
});

/**
 *  takes in a json object of new user preferences and sets them in the database
 *  returns a success bool and message
 */
router.post('/setpreferences', function (req, res) {
  let userEmail;
  const responseJSON = {
    success: false,
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
  User.findOne({ email: sanitize(req.body.email) }, function (err, user) {
    if (user) {
      responseJSON.message = 'User with that email already exists.';
      res.json(responseJSON);
    } else {
      User.findOne({ email: sanitize(userEmail) }, function (err, user) {
        if (err) throw err;

        if (req.body.email) {
          user.email = req.body.email;
          responseJSON.newtoken = jwt.encode({ userEmail: req.body.email }, secret);
          responseJSON.message = 'Successfully Made Changes!';
        }

        if (req.body.password) {
          const salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(req.body.password, salt);
          responseJSON.message = 'Successfully Made Changes!';
        }

        if (req.body.uvThresh) {
          user.uvThresh = req.body.uvThresh;
          responseJSON.message = 'Successfully Made Changes!';
        }

        user.save(function (err, user) {
          if (err) throw err;

          res.json(responseJSON);
        });
      });
    }
  });
});

module.exports = router;