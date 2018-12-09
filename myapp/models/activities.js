const db = require('../db');

const activitySchema = new db.Schema({
  startTime: { type: Date, required: true },
  distance: { type: Number },
  deviceID: { type: String, required: true },
  activityType: { type: String },
  uvExposure: { type: Number },
  avgSpeed: { type: Number },
  published_at: { type: Date, default: Date.now },
  events: [{ type: db.Schema.ObjectId, ref: 'Event' }],
});

const Device = db.model('Activity', activitySchema);

module.exports = Device;