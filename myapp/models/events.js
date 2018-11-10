const db = require('../db');

const eventSchema = new db.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  deviceID: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
});

const Event = db.model('Event', eventSchema);

module.exports = Event;