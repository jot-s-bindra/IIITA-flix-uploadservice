const { kafka } = require('../config/kafkaClient')
const Video = require('../models/Video'); // MongoDB Video model
const connectDB = require('../config/mongoConfig'); // MongoDB connection

connectDB(); // ✅ Connect to MongoDB

async function startTranscoderStatusConsumer() {
    try {
        console.log('🔥 Kafka Consumer: Starting Upload Service for Transcoder Status...');

        const consumer = kafka.consumer({ groupId: 'upload-service-transcoder-group' });
        console.log('🛜 Kafka Consumer: Connecting...');

        await consumer.connect();
        console.log('✅ Kafka Consumer Connected to Kafka Broker');

        const topic = 'transcoder-status-update';
        await consumer.subscribe({ topic, fromBeginning: false });
        console.log(`📡 Kafka Consumer Subscribed to Topic: ${topic}`);

        await consumer.run({
            eachBatch: async ({ batch, heartbeat }) => {
                const messages = batch.messages.map((msg) => JSON.parse(msg.value.toString()));
                console.log(`🔥 Kafka Consumer: Processing Batch - ${messages.length} messages`);

                try {
                    // ✅ Process messages in chunks of 10
                    for (let i = 0; i < messages.length; i += 10) {
                        const chunk = messages.slice(i, i + 10); // Get next 10 messages or fewer
                        console.log(`🚀 Processing Chunk of ${chunk.length} messages`);

                        // ✅ Bulk update existing documents in MongoDB
                        const bulkOperations = chunk.map(msg => ({
                            updateOne: {
                                filter: { userId: msg.userId, title: msg.title }, // Unique combination
                                update: { $set: { status: msg.status } } // ✅ Update only the status field
                            }
                        }));

                        // ✅ Perform Bulk Update
                        if (bulkOperations.length > 0) {
                            const result = await Video.bulkWrite(bulkOperations);
                            console.log(`✅ Updated ${result.modifiedCount} documents in MongoDB`);
                        }
                    }

                    await heartbeat(); // ✅ Prevent Kafka consumer rebalancing
                    console.log(`✅ All Messages in Batch Processed`);
                } catch (err) {
                    console.error('❌ Error processing batch:', err);
                }
            }
        });

        console.log('✅ Kafka Consumer is Running...');
    } catch (err) {
        console.error('❌ Kafka Consumer Error:', err);
    }
}

module.exports = startTranscoderStatusConsumer;
