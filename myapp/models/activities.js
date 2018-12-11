const db = require('../db');

const activitySchema = new db.Schema({
  startTime: { type: Number, required: true },
  deviceID: { type: String, required: true },
  startLat: { type: Number },
  startLong: { type: Number },
  distance: { type: Number },
  avgSpeed: { type: Number },
  duration: { type: Number },
  uvExposure: { type: Number },
  activityType: { type: String },
  published_at: { type: Date, default: Date.now },
  events: [{ type: db.Schema.ObjectId, ref: 'Event' }],
});

const Device = db.model('Activity', activitySchema);

module.exports = Device;