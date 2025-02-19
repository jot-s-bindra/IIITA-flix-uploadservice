const express = require('express')
const cors = require('cors')
require('dotenv').config()
const generatePresignedUrl = require('./s3')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.post('/api/upload-url', async (req, res) => {
  try {
    const { title, fileType, userId } = req.body

    if (!title || !fileType || !userId) {
      return res.status(400).json({ error: 'Title, file type, and user ID are required' })
    }

    const presignedUrl = await generatePresignedUrl(title, fileType, userId)

    res.json({ presignedUrl })
  } catch (error) {
    console.error('Error generating pre-signed URL:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Upload service is running on port ${PORT}`)
})
