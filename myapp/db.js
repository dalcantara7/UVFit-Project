const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mydb');

module.exports = mongoose;