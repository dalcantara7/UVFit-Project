'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/events');

const router = express.Router();

mongoose.connect('mongodb://localhost/mydb');

router.post('/register', function (req, res, next) {

});

router.get('/', function (req, res, next) {
  res.send('Successfully accessed DEVICES route');
});

router.post('/reportevent', function (req, res, next) {
  const data = JSON.parse(req.body.data);

  if (!data.hasOwnProperty('longitude')) { res.status(201).send('Missing longitude field'); }
  if (!data.hasOwnProperty('latitude')) { res.status(201).send('Missing latitude field'); }
  if (!req.body.hasOwnProperty('deviceID')) { res.status(201).send('Missing deviceID field'); }

  const currEvent = new Event({
    longitude: parseFloat(data.longitude).toFixed(6),
    latitude: parseFloat(data.latitude).toFixed(6),
    deviceID: req.body.deviceID,
  });

  currEvent.save(function (err, currEvent) {
    if (err) throw err;

    res.send('Event at Lat: ' + data.latitude.toFixed(6) + ' Long: ' + data.longitude.toFixed(6) + ' was successfully saved with id ' + currEvent._id);
  });
});

module.exports = router;
