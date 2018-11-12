const express = require('express');
const fs = require('fs');
const jwt = require('jwt-simple');
const path = require('path');
const Device = require('../models/devices');
const Event = require('../models/events');

const router = express.Router();

/* Authenticate user */
// const secret = fs.readFileSync(path.resolve(__dirname, '../jwtkey.txt')).toString();

// function getNewApikey() {
//   let newApikey = '';
//   const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

//   for (let i = 0; i < 32; i++) {
//     newApikey += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
//   }

//   return newApikey;
// }

// router.post('/register', function (req, res, next) {
//   const responseJson = {
//     registered: false,
//     message: '',
//     apikey: 'none',
//   };

//   if (!req.body.hasOwnProperty('deviceID')) {
//     responseJson.message = 'Missing deviceID!';
//     return res.status(400).json(responseJson);
//   }

//   let email = '';

//   if (req.headers['x-auth']) {
//     try {
//       const decodedToken = jwt.decode(req.header['x-auth'], secret);
//       email = decodedToken.email;
//     } catch (ex) {
//       responseJson.message = 'Invalid authorization token.';
//       return res.status(400).json(responseJson);
//     }
//   } else {
//     if (!req.body.hasOwnProperty('email')) {
//       responseJson.message = 'Invalid authorization token or missing email address.';
//       return res.status(400).json(responseJson);
//     }
//     email = req.body.email;
//   }

//   // Has the device already been registered?
//   Device.findOne({ deviceID: req.body.deviceID }, function (err, device) {
//     // If the device was found, it's already been registered
//     if (device !== null) {
//       responseJson.message = 'Device ID ' + req.body.deviceID + 'already registered.';
//       return res.status(400).json(responseJson);
//     } else {
//       const deviceApiKey = getNewApikey();

//       const newDevice = new Device({
//         deviceID: req.body.deviceID,
//         userEmail: email,
//         apikey: deviceApiKey,
//       });

//       newDevice.save(function (err, newDevice) {
//         if (err) {
//           console.log('Error: ' + err);
//           responseJson.message = err;
//           return res.status(400).json(responseJson);
//         } else {
//           responseJson.registered = true;
//           responseJson.apikey = newDevice.deviceApikey;
//           responseJson.message = 'Device ID ' + req.body.deviceID + 'was registered.';
//           return res.status(201).json(responseJson);
//         }
//       });
//     }
//   });
// });

router.get('/', function (req, res, next) {
  res.send('Successfully accessed DEVICES route');
});

// // Checking to see if device IDs have been registered
// router.get('/status/:devid', function (req, res, next) {
//   const deviceID = req.query.devid;
//   const responseJson = { devices: [] };
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
//         responseJson.devices.push({ deviceID: doc.deviceID, lastContact: doc.lastContact });
//       }
//     }
//     res.status(200).json(responseJson);
//   });
// });

router.post('/reportevent', function (req, res, next) {
  const data = JSON.parse(req.body.data);

  if (!data.hasOwnProperty('longitude')) { res.status(201).send('Missing longitude field'); }
  if (!data.hasOwnProperty('latitude')) { res.status(201).send('Missing latitude field'); }
  if (!req.body.hasOwnProperty('deviceID')) { res.status(201).send('Missing deviceID field'); }
  if (!data.hasOwnProperty('uvVal')) { res.status(201).send('Missing UV value field'); }
  if (!data.hasOwnProperty('speed')) { res.status(201).send('Missing speed field'); }

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

router.get('/events', function (req, res, next) {
  res.sendFile(path.resolve('./public/viewEvents.html'));
});

router.get('/getevents', function (req, res) {
  Event.find(function (err, events) {
    for (const event of events) {
      console.log(event);
    }
  });

  res.send('testing');
});

module.exports = router;