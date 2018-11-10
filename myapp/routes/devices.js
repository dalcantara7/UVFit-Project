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
  if (!JSON.parse(req.body.data).longitude) { res.status(201).send('Missing longitude field'); }
  if (!JSON.parse(req.body.data).latitude) { res.status(201).send('Missing latitude field'); }
  if (!JSON.parse(req.body.data).deviceID) { res.status(201).send('Missing deviceID field'); }

  const currEvent = new Event({
    longitude: parseFloat(JSON.parse(req.body.data).longitude).toFixed(6),
    latitude: parseFloat(JSON.parse(req.body.data).latitude).toFixed(6),
    deviceID: req.body.deviceID,
  });

  currEvent.save(function (err, currEvent) {
    if (err) throw err;

    res.send('Event at Lat: ' + JSON.parse(req.body.data).latitude.toFixed(6) + ' Long: ' + JSON.parse(req.body.data).longitude.toFixed(6) + ' was successfully saved with id ' + currEvent._id);
  });
});

module.exports = router;
