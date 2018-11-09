const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mydb', { useNewUrlParser: true });

module.exports = mongoose;