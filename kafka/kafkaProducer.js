// kafkaProducer.js
const { kafka } = require('../config/kafkaClient')

const producer = kafka.producer()

exports.sendKafkaEvent = async (topic, message) => {
  try {
    await producer.connect()
    console.log(`Kafka Producer Connected for Topic: ${topic}`)

    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }]
    })

    console.log(`Event sent to Kafka Topic: ${topic}`)
    await producer.disconnect()
  } catch (err) {
    console.error(`Error sending Kafka event: ${err.message}`)
  }
}