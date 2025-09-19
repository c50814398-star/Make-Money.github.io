const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {type: String, unique: true, required: true},
  passwordHash: {type: String, required: true},
  displayName: {type: String},
  balance: {type: Number, default: 0},
  role: {type: String, default: 'user'}, // 'admin' or 'user'
  createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', UserSchema);
