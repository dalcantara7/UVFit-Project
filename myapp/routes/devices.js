/* eslint-disable no-loop-func */

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
  let userEmail;
  const responseJSON = {
    success: false,
    message: '',
  };

  // authentication check
  if (req.headers.x_auth) {
    try {
      const token = jwt.decode(req.headers.x_auth, secret);
      userEmail = token.userEmail;
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

  User.findOne({ email: userEmail }, function (err, user) {
    if (err) throw err;

    request({
      method: 'POST',
      uri: 'https://api.particle.io/v1/devices/' + req.body.deviceID + '/apiAndUV',
      form: {
        access_token: particleToken,
        args: req.body.apikey + ':::' + user.uvThresh,
      },
    });

    responseJSON.success = true;
    responseJSON.message = 'Device ID ' + req.body.deviceid + ' pinged.';
    res.json(responseJSON);
  });
});

router.post('/reportevent', function (req, res, next) {
  const data = req.body.data;

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

          currEvent.save();

          if (!activity) {
            const currActivity = new Activity({
              startTime: parseInt(data.startTime, 10),
              deviceID: req.body.deviceID,
              events: [currEvent._id],
            });

            currActivity.save(function (err, activity) {
              if (err) throw err;

              res.status(201).json({
                success: true,
                message: 'Activity with start time ' + activity.startTime + ' was successfully saved!',
              });
            });
          } else {
            activity.events.push(currEvent._id);
            activity.save(function (err, activity) {
              if (err) throw err;

              res.status(200).json({
                success: true,
                message: 'Activity with start time ' + activity.startTime + ' was succesfully updated',
              });
            });
          }
        });
      } else {
        res.status(400).json({ success: false, error: 'Invalid API key' });
      }
    }
  });
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

  if (!req.query.startTime) { res.status(400).json({ success: false, message: 'Missing start time param' }); }

  User.findOne({ email: userEmail }, function (err, user) {
    if (err) throw err;

    Activity.findOne({ startTime: req.query.startTime }, function (err, activity) {
      if (err) throw err;

      Event.find({ _id: { $in: activity.events } }, function (err, events) {
        if (err) throw err;

        res.json({ success: true, events: events });
      });
    });
  });
});

router.get('/getactivities', function (req, res, next) {
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

  if (req.query.local === 'f') {
    User.findOne({ email: userEmail }, function (err, user) {
      if (err) throw err;

      Activity.find({ deviceID: { $in: user.deviceIDs } }, function (err, activities) {
        if (err) throw err;

        calcData(activities);

        res.json({ success: true, activities: activities, message: 'Activities for ' + user.username });
      });
    });
  }

  if (req.query.local === 't') {
    const latitude = parseFloat(req.query.lat);
    const longitude = parseFloat(req.query.long);
    const responseJSON = {
      success: true,
      activities: [],
      message: 'Local Activities',
    };

    console.log('Lat: ' + latitude + 'Long: ' + longitude);

    Activity.find({}, function (err, activities) {
      if (err) throw err;

      calcData(activities);

      for (const activity of activities) {
        console.log(distance(latitude, longitude, activity.startlat, activity.startLong));
        if (distance(latitude, longitude, activity.startlat, activity.startLong) < 7) {
          responseJSON.activities.push(activity);
        }
      }

      res.json(responseJSON);
    });
  }
});

function calcData(activities) {
  let totalDistance;
  let totalSpeed;
  let totalUV;

  for (const activity of activities) {
    totalDistance = 0;
    totalSpeed = 0;
    totalUV = 0;

    Event.find({ _id: { $in: activity.events } }, function (err, events) {
      if (err) throw err;

      activity.startLat = events[0].latitude;
      activity.startLong = events[0].longitude;

      for (const [index, event] of events.entries()) {
        // distance
        if (index !== events.length - 1) {
          totalDistance += distance(event.latitude, event.longitude,
            events[index + 1].latitude,
            events[index + 1].longitude);
        }
        totalSpeed += event.speed;
        totalUV += event.uvVal;
      }
      activity.avgSpeed = totalSpeed / events.length;
      activity.distance = totalDistance;
      activity.duration = events.length;
      activity.uvExposure = totalUV;

      if (totalSpeed / events.length < 5) {
        activity.activityType = 'Walking';
      } else if (totalSpeed / events.length < 15) {
        activity.activityType = 'Running';
      } else {
        activity.activityType = 'Cycling';
      }

      activity.save();
    });
  }
}

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