// kafkaConsumer.js
const { kafka } = require('./kafkaClient')
const { sendKafkaEvent } = require('./kafkaProducer')

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

        for (const data of messages) {
          await sendKafkaEvent('video-uploaded-to-temp-transcode', data)
          console.log(`Triggered Kafka Event: video-uploaded-to-temp-transcode for ${data.userId}`)
        }

        await heartbeat()
      } catch (err) {
        console.error('Error processing batch:', err)
      }
    }
  })
}

startKafkaConsumer().catch(console.error)
