// kafkaClient.js
const { Kafka } = require('kafkajs')
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

exports.kafka = new Kafka({
  clientId: 'iiita-flix-upload-service',
  brokers: process.env.KAFKA_BROKER.split(','),
})