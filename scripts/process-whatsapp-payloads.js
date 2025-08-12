const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://whatsapp:Ssr20122002@vistagram.phcydle.mongodb.net/?retryWrites=true&w=majority&appName=Vistagram';
const DATABASE_NAME = 'whatsapp';
const COLLECTION_NAME = 'processed_messages';

// Payloads directory
const PAYLOADS_DIR = path.join(__dirname, '..', 'payloads');

class WhatsAppPayloadProcessor {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(DATABASE_NAME);
      this.collection = this.db.collection(COLLECTION_NAME);
      console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  // Read all payload files from the payloads directory
  readPayloadFiles() {
    try {
      const files = fs.readdirSync(PAYLOADS_DIR);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      console.log(`📁 Found ${jsonFiles.length} payload files`);
      return jsonFiles;
    } catch (error) {
      console.error('❌ Error reading payload directory:', error);
      throw error;
    }
  }

  // Parse a single payload file
  parsePayloadFile(filename) {
    try {
      const filePath = path.join(PAYLOADS_DIR, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const payload = JSON.parse(fileContent);
      return { filename, payload };
    } catch (error) {
      console.error(`❌ Error parsing ${filename}:`, error);
      throw error;
    }
  }

  // Determine if payload is a message or status payload
  getPayloadType(payload) {
    const changes = payload.metaData?.entry?.[0]?.changes?.[0]?.value;
    
    if (changes?.messages && changes.messages.length > 0) {
      return 'message';
    } else if (changes?.statuses && changes.statuses.length > 0) {
      return 'status';
    } else {
      return 'unknown';
    }
  }

  // Extract message data from payload
  extractMessageData(payload) {
    const changes = payload.metaData.entry[0].changes[0].value;
    const contact = changes.contacts[0];
    const message = changes.messages[0];
    const metadata = changes.metadata;

    return {
      message_id: message.id,
      meta_msg_id: message.id, // Same as message_id for messages
      from: message.from,
      to: metadata.display_phone_number,
      phone_number_id: metadata.phone_number_id,
      contact_name: contact.profile.name,
      contact_wa_id: contact.wa_id,
      message_type: message.type,
      message_body: message.text?.body || '',
      timestamp: parseInt(message.timestamp),
      status: 'received', // Initial status for received messages
      conversation_id: payload._id,
      gs_app_id: payload.metaData.gs_app_id,
      created_at: new Date(payload.createdAt),
      processed_at: new Date(),
      payload_source: payload.payload_type
    };
  }

  // Extract status data from payload
  extractStatusData(payload) {
    const changes = payload.metaData.entry[0].changes[0].value;
    const status = changes.statuses[0];
    const metadata = changes.metadata;

    return {
      message_id: status.id,
      meta_msg_id: status.meta_msg_id,
      recipient_id: status.recipient_id,
      status: status.status, // sent, delivered, read
      timestamp: parseInt(status.timestamp),
      conversation_id: status.conversation?.id,
      gs_id: status.gs_id,
      phone_number_id: metadata.phone_number_id,
      processed_at: new Date(),
      payload_source: payload.payload_type
    };
  }

  // Insert message into MongoDB
  async insertMessage(messageData) {
    try {
      // Check if message already exists
      const existingMessage = await this.collection.findOne({ 
        message_id: messageData.message_id 
      });

      if (existingMessage) {
        console.log(`⚠️  Message ${messageData.message_id} already exists, skipping...`);
        return existingMessage._id;
      }

      const result = await this.collection.insertOne(messageData);
      console.log(`✅ Inserted message: ${messageData.message_id}`);
      return result.insertedId;
    } catch (error) {
      console.error(`❌ Error inserting message ${messageData.message_id}:`, error);
      throw error;
    }
  }

  // Update message status in MongoDB
  async updateMessageStatus(statusData) {
    try {
      // Try to find message by meta_msg_id first, then by message_id
      let message = await this.collection.findOne({ 
        meta_msg_id: statusData.meta_msg_id 
      });

      if (!message) {
        message = await this.collection.findOne({ 
          message_id: statusData.message_id 
        });
      }

      if (!message) {
        console.log(`⚠️  Message not found for status update: ${statusData.meta_msg_id}`);
        return null;
      }

      const updateData = {
        status: statusData.status,
        status_updated_at: new Date(),
        last_status_timestamp: statusData.timestamp
      };

      // Add conversation_id if not present
      if (statusData.conversation_id && !message.conversation_id) {
        updateData.conversation_id = statusData.conversation_id;
      }

      // Add gs_id if not present
      if (statusData.gs_id && !message.gs_id) {
        updateData.gs_id = statusData.gs_id;
      }

      const result = await this.collection.updateOne(
        { _id: message._id },
        { $set: updateData }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Updated status for message ${statusData.meta_msg_id}: ${statusData.status}`);
      } else {
        console.log(`ℹ️  No changes made for message ${statusData.meta_msg_id}`);
      }

      return result.modifiedCount;
    } catch (error) {
      console.error(`❌ Error updating status for ${statusData.meta_msg_id}:`, error);
      throw error;
    }
  }

  // Process a single payload file
  async processPayloadFile(filename) {
    try {
      const { payload } = this.parsePayloadFile(filename);
      const payloadType = this.getPayloadType(payload);

      console.log(`📄 Processing ${filename} (${payloadType})`);

      if (payloadType === 'message') {
        const messageData = this.extractMessageData(payload);
        await this.insertMessage(messageData);
      } else if (payloadType === 'status') {
        const statusData = this.extractStatusData(payload);
        await this.updateMessageStatus(statusData);
      } else {
        console.log(`⚠️  Unknown payload type in ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error);
      throw error;
    }
  }

  // Process all payload files
  async processAllPayloads() {
    try {
      const files = this.readPayloadFiles();
      
      console.log('\n🚀 Starting payload processing...\n');

      for (const filename of files) {
        await this.processPayloadFile(filename);
      }

      console.log('\n✅ All payloads processed successfully!');
      
      // Display summary
      await this.displaySummary();
    } catch (error) {
      console.error('❌ Error processing payloads:', error);
      throw error;
    }
  }

  // Display processing summary
  async displaySummary() {
    try {
      const totalMessages = await this.collection.countDocuments();
      const statusCounts = await this.collection.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      console.log('\n📊 Processing Summary:');
      console.log(`Total messages in collection: ${totalMessages}`);
      console.log('Status breakdown:');
      
      statusCounts.forEach(status => {
        console.log(`  ${status._id}: ${status.count}`);
      });

      // Show recent messages
      const recentMessages = await this.collection
        .find({})
        .sort({ processed_at: -1 })
        .limit(5)
        .toArray();

      console.log('\n📝 Recent messages:');
      recentMessages.forEach(msg => {
        console.log(`  ${msg.message_id}: ${msg.status} - "${msg.message_body.substring(0, 50)}..."`);
      });

    } catch (error) {
      console.error('❌ Error displaying summary:', error);
    }
  }

  // Create indexes for better performance
  async createIndexes() {
    try {
      await this.collection.createIndex({ message_id: 1 }, { unique: true });
      await this.collection.createIndex({ meta_msg_id: 1 });
      await this.collection.createIndex({ status: 1 });
      await this.collection.createIndex({ processed_at: 1 });
      await this.collection.createIndex({ conversation_id: 1 });
      console.log('✅ Database indexes created');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
    }
  }
}

// Main execution function
async function main() {
  const processor = new WhatsAppPayloadProcessor();
  
  try {
    await processor.connect();
    await processor.createIndexes();
    await processor.processAllPayloads();
  } catch (error) {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  } finally {
    await processor.disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = WhatsAppPayloadProcessor;
