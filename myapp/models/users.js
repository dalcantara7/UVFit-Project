const db = require('../db');

const userSchema = new db.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  regDate: { type: Date, required: true, default: Date.now },
  deviceID: { type: String, unique: true },
});

const User = db.model('User', userSchema);

module.exports = User;