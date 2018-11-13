const db = require('../db');

const deviceSchema = new db.Schema({
  apikey: String,
  deviceID: { type: String, unique: true },
  userEmail: { type: String, unique: true },
  lastContact: { type: Date, default: Date.now },
});

const Device = db.model('Device', deviceSchema);

module.exports = Device;