const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  type: { type: String, enum: ['watched','liked','commented','shared'], required: true },
  proofUrl: { type: String },      // e.g., link to their shared post or comment
  proofImg: { type: String },      // path to uploaded screenshot (server)
  approved: { type: Boolean, default: false }, // admin reviews
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Action', ActionSchema);
