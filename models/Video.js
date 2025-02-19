// models/Video.js
const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  bucket: { type: String, required: true },
  fileType: { type: String, default: 'video/mp4' },
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Video', videoSchema)
