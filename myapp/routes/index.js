'use strict';

const express = require('express');
const path = require('path');
const exec = require('child_process').exec;

const router = express.Router();

router.get('/', function (req, res) {
  res.sendFile(path.resolve('./public/index.html'));
});


// continuous integration through github webhook
router.post('/', function (req, res) {
  exec('./restart.sh', function (error, stdout, stderr) {
    console.log(error);
    console.log(stdout);
    console.log(stderr);
  });

  res.json({ message: 'Successful Restart' });
});

module.exports = router;