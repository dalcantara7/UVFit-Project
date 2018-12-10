const db = require('../db');

const userSchema = new db.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  uvThresh: { type: Number, required: true, default: 40 },
  regDate: { type: Date, required: true, default: Date.now },
  deviceIDs: [String],
});

const User = db.model('User', userSchema);

module.exports = User;