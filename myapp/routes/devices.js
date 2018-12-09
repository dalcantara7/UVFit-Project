'use strict';

const express = require('express');
const fs = require('fs');
const jwt = require('jwt-simple');
const sanitize = require('mongo-sanitize');
const path = require('path');
const request = require('request');
const Device = require('../models/devices');
const Event = require('../models/events');
const Activity = require('../models/activities');
const User = require('../models/users');

const router = express.Router();

/* Authenticate user */
const secret = fs.readFileSync(path.resolve(__dirname, '../jwtkey.txt')).toString();
const particleToken = fs.readFileSync(path.resolve(__dirname, '../particlekey.txt')).toString();

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
  Device.findOne({ deviceID: sanitize(req.body.deviceID) }, function (err, device) {
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

router.post('/sendinfo', function (req, res, next) {
  const responseJSON = {
    success: false,
    message: '',
  };

  // authentication check
  if (req.headers.x_auth) {
    try {
      const token = jwt.decode(req.headers.x_auth, secret);
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

  if (!req.body.deviceID) {
    responseJSON.message = 'missing device id';
    res.status(400).json(responseJSON);
  }

  request({
    method: 'POST',
    uri: 'https://api.particle.io/v1/devices/' + req.body.deviceID + '/apiAndUV',
    form: {
      access_token: particleToken,
      args: req.body.apikey + ':::' + 40,
    },
  });

  responseJSON.success = true;
  responseJSON.message = 'Device ID ' + req.body.deviceid + ' pinged.';
  res.json(responseJSON);
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
  console.log(req.body);
  console.log(req.body.data);

  try {
    const data = JSON.parse(req.body.data);
  } catch (ex) {
    console.log(ex);
  }

  if (!data.hasOwnProperty('apiKey')) { res.status(400).json({ success: false, message: 'Missing device API key' }); }
  if (!data.hasOwnProperty('longitude')) { res.status(400).json({ success: false, message: 'Missing longitude field' }); }
  if (!data.hasOwnProperty('latitude')) { res.status(400).json({ success: false, message: 'Missing latitude field' }); }
  if (!req.body.hasOwnProperty('deviceID')) { res.status(400).json({ success: false, message: 'Missing deviceID field' }); }
  if (!data.hasOwnProperty('uvVal')) { res.status(400).json({ success: false, message: 'Missing UV value field' }); }
  if (!data.hasOwnProperty('speed')) { res.status(400).json({ success: false, message: 'Missing speed field' }); }
  if (!data.hasOwnProperty('startTime')) { res.status(400).json({ success: false, message: 'Missing start time field' }); }

  Device.findOne({ deviceID: req.body.deviceID }, function (err, device) {
    if (err) {
      res.status(400).json({ success: false, error: err });
    } else if (device) {
      if (device.apikey === data.apiKey) {
        Activity.findOne({ startTime: data.startTime }, function (err, activity) {
          if (err) throw err;

          const currEvent = new Event({
            longitude: parseFloat(data.longitude).toFixed(6),
            latitude: parseFloat(data.latitude).toFixed(6),
            uvVal: parseFloat(data.uvVal),
            speed: parseFloat(data.speed),
            deviceID: req.body.deviceID,
          });

          if (!activity) {
            const currActivity = new Activity({
              startTime: parseInt(data.startTime, 10),
              deviceID: req.body.deviceID,
            });

            currActivity.save(function (err, activity) {
              if (err) throw err;

              console.log('Activity with start time' + currActivity.startTime + ' was successfully saved!');

              res.status(201).json({
                success: true,
                message: 'Activity with start time' + currActivity.startTime + ' was successfully saved!',
              });
            });
          } else {
            activity.events.push(currEvent);
            activity.save(function (err, activity) {
              if (err) throw err;

              console.log('Activity with start time' + activity.startTime + ' was succesfully updated');

              res.status(200).json({ success: true });
            });
          }
        });
      } else {
        res.status(400).json({ success: false, error: 'Invalid API key' });
      }
    }
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

      res.json({ success: true, events: events, message: 'Activities for ' + user.username });
    });
  });
});

function distance(lat1, lon1, lat2, lon2) {
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0;
  } else {
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;
    const theta = lon1 - lon2;
    const radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1)
               * Math.sin(radlat2)
               + Math.cos(radlat1)
               * Math.cos(radlat2)
               * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist;
  }
}

module.exports = router;