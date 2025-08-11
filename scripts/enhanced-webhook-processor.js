import { MongoClient } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import config from './config.js';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedWhatsAppWebhookProcessor {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
    this.stats = {
      processed: 0,
      errors: 0,
      skipped: 0,
      startTime: null,
      endTime: null,
    };
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI || config.mongodb.uri;
      const dbName = process.env.MONGODB_DATABASE || config.mongodb.database;
      const collectionName = process.env.MONGODB_COLLECTION || config.mongodb.collection;

      this.client = new MongoClient(uri, config.mongodb.options);
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.collection = this.db.collection(collectionName);

      await this.createIndexes();

      console.log('✅ Connected to MongoDB successfully');
      console.log(`📊 Database: ${dbName}`);
      console.log(`📋 Collection: ${collectionName}`);
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      for (const indexConfig of config.indexes) {
        const options = indexConfig.unique ? { unique: true } : {};
        await this.collection.createIndex(indexConfig.key, options);
      }
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }

  async processPayload(payload) {
    try {
      const payloadType = this.determinePayloadType(payload);

      switch (payloadType) {
        case 'message':
          await this.processMessagePayload(payload);
          break;
        case 'status':
          await this.processStatusPayload(payload);
          break;
        default:
          console.warn('⚠️ Unknown payload type:', payloadType);
          this.stats.skipped++;
      }

      this.stats.processed++;
    } catch (error) {
      console.error('❌ Error processing payload:', error);
      this.stats.errors++;
      throw error;
    }
  }

  determinePayloadType(payload) {
    const value = payload.metaData?.entry?.[0]?.changes?.[0]?.value;

    if (value?.messages) {
      return 'message';
    }

    if (value?.statuses) {
      return 'status';
    }

    return 'unknown';
  }

  async processMessagePayload(payload) {
    const entry = payload.metaData.entry[0];
    const value = entry.changes[0].value;

    for (const message of value.messages) {
      const contact = value.contacts.find((c) => c.wa_id === message.from);

      const messageDoc = {
        message_id: message.id,
        meta_msg_id: message.id,
        wa_id: message.from,
        contact_name: contact?.profile?.name || 'Unknown',
        message_type: message.type,
        message_body: this.extractMessageBody(message),
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        status: config.whatsapp.defaultStatus,
        phone_number_id: value.metadata.phone_number_id,
        display_phone_number: value.metadata.display_phone_number,
        conversation_id: payload._id,
        gs_app_id: payload.metaData.gs_app_id,
        created_at: new Date(payload.createdAt),
        processed_at: new Date(),
        raw_payload: payload,
      };

      await this.insertMessage(messageDoc);
    }
  }

  extractMessageBody(message) {
    switch (message.type) {
      case 'text':
        return message.text?.body || '';
      case 'image':
        return `[Image] ${message.image?.caption || ''}`;
      case 'video':
        return `[Video] ${message.video?.caption || ''}`;
      case 'audio':
        return '[Audio Message]';
      case 'document':
        return `[Document] ${message.document?.filename || ''}`;
      case 'location':
        return `[Location] ${message.location?.name || ''}`;
      case 'contact':
        return `[Contact] ${message.contacts?.[0]?.name || ''}`;
      default:
        return `[${message.type}]`;
    }
  }

  async insertMessage(messageDoc) {
    try {
      const existingMessage = await this.collection.findOne({ message_id: messageDoc.message_id });

      if (existingMessage) {
        console.log(`📝 Message already exists: ${messageDoc.message_id}`);
        this.stats.skipped++;
        return;
      }

      await this.collection.insertOne(messageDoc);
      console.log(`✅ Processed incoming message: ${messageDoc.message_id} from ${messageDoc.contact_name}`);
    } catch (error) {
      console.error(`❌ Error inserting message ${messageDoc.message_id}:`, error);
      throw error;
    }
  }

  async processStatusPayload(payload) {
    const entry = payload.metaData.entry[0];
    const value = entry.changes[0].value;

    for (const status of value.statuses) {
      const updateDoc = {
        status: status.status,
        status_timestamp: new Date(parseInt(status.timestamp) * 1000),
        conversation_id: status.conversation?.id,
        gs_id: status.gs_id,
        recipient_id: status.recipient_id,
        updated_at: new Date(),
        status_payload: status,
      };

      await this.updateMessageStatus(status, updateDoc, value.metadata);
    }
  }

  async updateMessageStatus(status, updateDoc, metadata) {
    try {
      const result = await this.collection.updateOne(
        {
          $or: [{ meta_msg_id: status.meta_msg_id }, { message_id: status.id }],
        },
        {
          $set: updateDoc,
          $setOnInsert: {
            message_id: status.id,
            meta_msg_id: status.meta_msg_id,
            wa_id: status.recipient_id,
            phone_number_id: metadata.phone_number_id,
            display_phone_number: metadata.display_phone_number,
            created_at: new Date(),
            processed_at: new Date(),
          },
        },
        { upsert: true }
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Updated status for message ${status.meta_msg_id || status.id}: ${status.status}`);
      } else if (result.upsertedCount > 0) {
        console.log(`✅ Created new status record for message ${status.meta_msg_id || status.id}: ${status.status}`);
      }
    } catch (error) {
      console.error(`❌ Error updating status for message ${status.meta_msg_id || status.id}:`, error);
      throw error;
    }
  }

  async processAllPayloads(payloadsDir = process.env.PAYLOADS_DIR || config.processing.payloadsDirectory) {
    try {
      this.stats.startTime = new Date();

      const files = await fs.readdir(payloadsDir);
      const jsonFiles = files.filter((file) => config.processing.supportedFileExtensions.some((ext) => file.endsWith(ext)));

      console.log(`📁 Found ${jsonFiles.length} supported payload files`);

      for (let i = 0; i < jsonFiles.length; i += config.processing.batchSize) {
        const batch = jsonFiles.slice(i, i + config.processing.batchSize);

        console.log(`\n📦 Processing batch ${Math.floor(i / config.processing.batchSize) + 1}/${Math.ceil(jsonFiles.length / config.processing.batchSize)}`);

        await Promise.allSettled(batch.map((file) => this.processFile(path.join(payloadsDir, file))));
      }

      this.stats.endTime = new Date();
      console.log('\n🎉 Finished processing all payload files');
    } catch (error) {
      console.error('❌ Error reading payloads directory:', error);
      throw error;
    }
  }

  async processFile(filePath) {
    const fileName = path.basename(filePath);

    try {
      console.log(`📄 Processing file: ${fileName}`);

      const fileContent = await fs.readFile(filePath, 'utf8');
      const payload = JSON.parse(fileContent);

      await this.processPayload(payload);
    } catch (error) {
      console.error(`❌ Error processing file ${fileName}:`, error);
      this.stats.errors++;
    }
  }

  async getMessageStats() {
    try {
      const stats = await this.collection
        .aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ])
        .toArray();

      console.log('\n📊 Message Statistics:');
      stats.forEach((stat) => {
        console.log(`  ${stat._id}: ${stat.count} messages`);
      });

      const totalMessages = await this.collection.countDocuments();
      console.log(`  Total messages: ${totalMessages}`);

      const processingTime = this.stats.endTime - this.stats.startTime;
      console.log('\n⚡ Processing Statistics:');
      console.log(`  Processed: ${this.stats.processed} payloads`);
      console.log(`  Errors: ${this.stats.errors}`);
      console.log(`  Skipped: ${this.stats.skipped}`);
      console.log(`  Processing time: ${processingTime}ms`);

      return { messageStats: stats, processingStats: this.stats };
    } catch (error) {
      console.error('❌ Error getting message stats:', error);
      throw error;
    }
  }

  async getRecentMessages(limit = 10) {
    try {
      const messages = await this.collection.find({}).sort({ timestamp: -1 }).limit(limit).toArray();

      console.log(`\n📋 Recent ${limit} messages:`);
      messages.forEach((msg) => {
        const timestamp = msg.timestamp ? msg.timestamp.toISOString() : 'Unknown';
        const contact = msg.contact_name || msg.wa_id;
        const body = msg.message_body || '[No content]';
        const status = msg.status || 'unknown';
        console.log(`  ${timestamp} - ${contact}: ${body} (${status})`);
      });

      return messages;
    } catch (error) {
      console.error('❌ Error getting recent messages:', error);
      throw error;
    }
  }

  async getConversationMessages(conversationId, limit = 50) {
    try {
      const messages = await this.collection
        .find({ conversation_id: conversationId })
        .sort({ timestamp: 1 })
        .limit(limit)
        .toArray();

      console.log(`\n💬 Messages for conversation ${conversationId}:`);
      messages.forEach((msg) => {
        const timestamp = msg.timestamp ? msg.timestamp.toISOString() : 'Unknown';
        const contact = msg.contact_name || msg.wa_id;
        const body = msg.message_body || '[No content]';
        const status = msg.status || 'unknown';
        console.log(`  ${timestamp} - ${contact}: ${body} (${status})`);
      });

      return messages;
    } catch (error) {
      console.error('❌ Error getting conversation messages:', error);
      throw error;
    }
  }

  async cleanupOldMessages(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await this.collection.deleteMany({ created_at: { $lt: cutoffDate } });

      console.log(`🧹 Cleaned up ${result.deletedCount} messages older than ${daysToKeep} days`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up old messages:', error);
      throw error;
    }
  }
}

export default EnhancedWhatsAppWebhookProcessor;

if (process.argv[1] && process.argv[1].endsWith('enhanced-webhook-processor.js')) {
  (async () => {
    const processor = new EnhancedWhatsAppWebhookProcessor();
    try {
      console.log('🚀 Starting Enhanced WhatsApp Webhook Processor...\n');
      await processor.connect();
      await processor.processAllPayloads();
      await processor.getMessageStats();
      await processor.getRecentMessages(5);
    } catch (error) {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    } finally {
      await processor.disconnect();
    }
  })();
}
