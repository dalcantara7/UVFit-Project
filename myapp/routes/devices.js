'use strict';

const express = require('express');
const fs = require('fs');
const jwt = require('jwt-simple');
const path = require('path');
const Device = require('../models/devices');
const Event = require('../models/events');
const User = require('../models/users');

const router = express.Router();

/* Authenticate user */
const secret = fs.readFileSync(path.resolve(__dirname, '../jwtkey.txt')).toString();

function getNewApikey() {
  let newApikey = '';
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i++) {
    newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return newApikey;
}

router.get('/register', function (req, res, next) {
  res.sendFile(path.resolve('./public/registerDevice.html'));
});

router.post('/register', function (req, res, next) {
  const responseJSON = {};
  let userEmail;

  if (!req.body.hasOwnProperty('deviceID')) {
    responseJSON.message = 'Missing deviceID!';
    responseJSON.success = false;
    res.send(responseJSON);
  }

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

  // Has the device already been registered?
  Device.findOne({ deviceID: req.body.deviceID }, function (err, device) {
    if (device) {
      responseJSON.message = 'Device ID ' + req.body.deviceID + ' is already registered.';
      responseJSON.success = false;
      res.json(responseJSON);
    } else {
      const deviceApiKey = getNewApikey();

      const newDevice = new Device({
        deviceID: req.body.deviceID,
        userEmail: userEmail,
        apikey: deviceApiKey,
      });

      newDevice.save(function (err, newDevice) {
        if (err) {
          throw err;
        } else {
          // associate device with user
          User.findOne({ email: userEmail }, function (err, user) {
            user.deviceIDs.push(newDevice.deviceID);
            user.save();
          });
          responseJSON.success = true;
          responseJSON.message = 'Device ID ' + newDevice.deviceID + ' was successfully registered to your account!';
          res.status(201).json(responseJSON);
        }
      });
    }
  });
});

// Checking to see if device IDs have been registered
// router.get('/status/:devid', function (req, res, next) {
//   const deviceID = req.query.devid;
//   const responseJSON = { devices: [] };
//   let query;

//   if (deviceID === 'all') {
//     query = {};
//   } else {
//     query = { deviceID: deviceID };
//   }

//   Device.find(query, function (err, allDevices) {
//     if (err) {
//       const errorMsg = { message: err };
//       res.status(400).json(errorMsg);
//     } else {
//       for (const doc of allDevices) {
//         responseJSON.devices.push({ deviceID: doc.deviceID, lastContact: doc.lastContact });
//       }
//     }
//     res.status(200).json(responseJSON);
//   });
// });

router.post('/reportevent', function (req, res, next) {
  const data = JSON.parse(req.body.data);

  if (!data.hasOwnProperty('longitude')) { res.send('Missing longitude field'); }
  if (!data.hasOwnProperty('latitude')) { res.send('Missing latitude field'); }
  if (!req.body.hasOwnProperty('deviceID')) { res.send('Missing deviceID field'); }
  if (!data.hasOwnProperty('uvVal')) { res.send('Missing UV value field'); }
  if (!data.hasOwnProperty('speed')) { res.send('Missing speed field'); }

  const currEvent = new Event({
    longitude: parseFloat(data.longitude).toFixed(6),
    latitude: parseFloat(data.latitude).toFixed(6),
    uvVal: parseFloat(data.uvVal),
    speed: parseFloat(data.speed),
    deviceID: req.body.deviceID,
  });

  currEvent.save(function (err, currEvent) {
    if (err) throw err;

    res.send('Event at Lat: ' + data.latitude.toFixed(6) + ' Long: ' + data.longitude.toFixed(6) + ' Speed: ' + data.speed + ' UV value: ' + data.uvVal + ' was saved with id ' + currEvent._id);
  });
});

router.get('/', function (req, res, next) {
  res.send('Successfully accessed DEVICES route');
});

router.get('/getevents', function (req, res, next) {
  let userEmail;

  if (req.headers.x_auth) {
    try {
      const token = req.headers.x_auth;
      userEmail = jwt.decode(token, secret).userEmail;
    } catch (ex) {
      res.status(401).json({ success: false, message: 'Invalid authorization token.' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Missing authorization token.' });
  }

  User.findOne({ email: userEmail }, function (err, user) {
    if (err) throw err;

    Event.find({ deviceID: { $in: user.deviceIDs } }, function (err, events) {
      if (err) throw err;

      res.json({ success: true, events: events, message: 'Events for user ' + user.username });
    });
  });
});

module.exports = router;