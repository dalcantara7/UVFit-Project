const db = require('../db');

const deviceSchema = new db.Schema({

});

const Device = db.model('Device', deviceSchema);

module.exports = Device;