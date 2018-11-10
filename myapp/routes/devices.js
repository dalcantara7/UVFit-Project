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
  if (!req.body.longitude) { res.status(201).send('Missing longitude field'); }
  if (!req.body.latitude) { res.status(201).send('Missing latitude field'); }
  if (!req.body.deviceID) { res.status(201).send('Missing deviceID field'); }

  const currEvent = new Event({
    longitude: parseFloat(req.body.longitude),
    latitude: parseFloat(req.body.latitude),
    deviceID: req.body.deviceID,
  });

  currEvent.save(function (err, currEvent) {
    if (err) throw err;

    res.send('Event at Lat: ' + req.body.latitude + ' Long: ' + req.body.longitude + ' was successfully saved with id ' + currEvent._id);
  });
});

module.exports = router;
