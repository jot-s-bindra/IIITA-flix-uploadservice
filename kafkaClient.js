// kafkaClient.js
const { Kafka } = require('kafkajs')
require('dotenv').config()

exports.kafka = new Kafka({
  clientId: 'iiita-flix-upload-service',
  brokers: process.env.KAFKA_BROKER.split(','),
})
