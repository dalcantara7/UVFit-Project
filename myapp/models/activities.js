const db = require('../db');
const Event = require('./events');

const activitySchema = new db.Schema({
  startTime: { type: Date, required: true },
  published_at: { type: Date, default: Date.now },
  events: [Event],
});

const Device = db.model('Activity', activitySchema);

module.exports = Device;