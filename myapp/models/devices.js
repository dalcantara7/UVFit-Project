const db = require('../db');

const deviceSchema = new db.Schema({
  apikey: String,
  deviceID: String,
  userEmail: String,
  lastContact: { type: Date, default: Date.now },
});

const Device = db.model('Device', deviceSchema);

module.exports = Device;