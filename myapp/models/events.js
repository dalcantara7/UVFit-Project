const db = require('../db');

const eventSchema = new db.Schema({
  data: {
    longitde: { type: Number, required: true },
    latitude: { type: Number, required: true },
  },
  deviceID: { type: String, required: true },
  published_at: { type: Date, required: true, default: Date.now },
});

const Event = db.model('Event', eventSchema);

module.exports = Event;