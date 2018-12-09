const db = require('../db');

const eventSchema = new db.Schema({
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  uvVal: { type: Number, required: true },
  speed: { type: Number, required: true },
  deviceID: { type: String, required: true },
});

const Event = db.model('Event', eventSchema);

module.exports = Event;