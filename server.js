const express = require('express')
const Video = require('./models/Video'); // ✅ Import Video model
const cors = require('cors')
require('dotenv').config()
const generatePresignedUrl = require('./controllers/generatePresignedUrl')
const { sendKafkaEvent } = require('./kafka/kafkaProducer')
const app = express()
const PORT = process.env.PORT || 5000
const connectDB = require('./config/mongoConfig')
connectDB() // ✅ Connects to MongoDB when server starts
const startTranscoderStatusConsumer = require('./kafka/kafkaTranscoderConsumer'); // New consumer for transcoder status
app.use(cors({
  origin: '*', // Or use your React app domain like: 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));app.use(express.json())
app.get('/api/videos', async (req, res) => {
  try {
      const videos = await Video.find({ status: 'done' }); // Get all videos with status "done"
      res.json(videos); // Send videos as JSON
  } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/api/upload-url', async (req, res) => {
  try {
    const { title, fileType, userId } = req.body

    if (!title || !fileType || !userId) {
      return res.status(400).json({ error: 'Title, file type, and user ID are required' })
    }
    console.log('Generating pre-signed URL for:', { title, fileType, userId })
    const presignedUrl = await generatePresignedUrl(title, fileType, userId)

    res.json({ presignedUrl })
  } catch (error) {
    console.error('Error generating pre-signed URL:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
app.post('/api/upload-success', async (req, res) => {
    const { userId, title, bucket } = req.body

    if (!userId || !title || !bucket) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    console.log('Upload success notification received:', { userId, title, bucket })

    // Kafka Payload
    const payload = {
        userId,
        title,
        bucket,
        fileType: 'video/mp4',
        timestamp: new Date().toISOString()
    }

    try {
        // 🔥 Send First Kafka Event: video-uploaded-to-temp-db
        await sendKafkaEvent('video-uploaded-to-temp-db', payload)
        return res.json({ message: 'Kafka event video-uploaded-to-temp-db sent successfully' })
    } catch (error) {
        console.error('Error sending Kafka event:', error)
        return res.status(500).json({ error: 'Error sending Kafka event' })
    }
})
startTranscoderStatusConsumer().catch(err => console.error('❌ Kafka Transcoder Consumer Error:', err)); // NEW CONSUMER
app.listen(PORT, () => {
  console.log(`Upload service is running on port ${PORT}`)
})