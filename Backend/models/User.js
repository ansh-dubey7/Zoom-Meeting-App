const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['instructor', 'student'], required: true },
  zoomAccessToken: String,
});

module.exports = mongoose.model('User', userSchema);