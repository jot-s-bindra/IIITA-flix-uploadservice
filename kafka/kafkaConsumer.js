// kafkaConsumer.js
const { kafka } = require('../config/kafkaClient')
const { sendKafkaEvent } = require('./kafkaProducer')
const Video = require('../models/Video')
const connectDB = require('../config/mongoConfig')
connectDB() // ✅ Connects to MongoDB when Kafka Consumer starts

async function startKafkaConsumer() {
  const consumer = kafka.consumer({ groupId: 'upload-service-group' })
  await consumer.connect()
  console.log('Kafka Consumer Connected to Topic: video-uploaded-to-temp-db')

  await consumer.subscribe({ topic: 'video-uploaded-to-temp-db', fromBeginning: false }) // ✅ Start from the latest message

  await consumer.run({
    eachBatch: async ({ batch, heartbeat }) => {
      const messages = batch.messages.map((message) => JSON.parse(message.value.toString()))
      console.log(`Kafka Consumer: Processing Batch - ${messages.length} messages`)

      try {
        console.log('Batch Messages:', messages)
        await Video.insertMany(messages)
        console.log(`✅ Inserted ${messages.length} records into MongoDB`)
    
        // 🔥 After Saving to DB, Trigger Transcode Event
        for (const data of messages) {
            await sendKafkaEvent('video-uploaded-to-temp-transcode', data)
            console.log(`Triggered Kafka Event: video-uploaded-to-temp-transcode for ${data.userId}`)
        }
    
        await heartbeat() // ✅ Prevent Kafka consumer rebalancing
    } catch (err) {
        console.error('❌ Error inserting batch into MongoDB:', err)
    }
    }
  })
}

startKafkaConsumer().catch(console.error)