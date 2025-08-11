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

const MONGODB_URI = process.env.MONGODB_URI || config.mongodb.uri;
const DATABASE_NAME = process.env.MONGODB_DATABASE || config.mongodb.database;
const COLLECTION_NAME = process.env.MONGODB_COLLECTION || config.mongodb.collection;

const PAYLOAD_TYPES = {
  MESSAGE: 'message',
  STATUS: 'status',
};

class WhatsAppWebhookProcessor {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    this.client = new MongoClient(MONGODB_URI, config.mongodb.options);
    await this.client.connect();
    this.db = this.client.db(DATABASE_NAME);
    this.collection = this.db.collection(COLLECTION_NAME);

    await this.collection.createIndex({ message_id: 1 });
    await this.collection.createIndex({ meta_msg_id: 1 });
    await this.collection.createIndex({ wa_id: 1 });
    await this.collection.createIndex({ timestamp: 1 });

    console.log('✅ Connected to MongoDB');
  }

  async disconnect() {
    if (this.client) await this.client.close();
  }

  determinePayloadType(payload) {
    if (payload.metaData?.entry?.[0]?.changes?.[0]?.value?.messages) return PAYLOAD_TYPES.MESSAGE;
    if (payload.metaData?.entry?.[0]?.changes?.[0]?.value?.statuses) return PAYLOAD_TYPES.STATUS;
    return 'unknown';
  }

  async processPayload(payload) {
    const type = this.determinePayloadType(payload);
    if (type === PAYLOAD_TYPES.MESSAGE) return this.processMessagePayload(payload);
    if (type === PAYLOAD_TYPES.STATUS) return this.processStatusPayload(payload);
    console.warn('⚠️ Unknown payload type');
  }

  async processMessagePayload(payload) {
    const value = payload.metaData.entry[0].changes[0].value;
    for (const message of value.messages) {
      const contact = value.contacts.find((c) => c.wa_id === message.from);
      const doc = {
        message_id: message.id,
        meta_msg_id: message.id,
        wa_id: message.from,
        contact_name: contact?.profile?.name || 'Unknown',
        message_type: message.type,
        message_body: message.text?.body || '',
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        status: 'received',
        phone_number_id: value.metadata.phone_number_id,
        display_phone_number: value.metadata.display_phone_number,
        conversation_id: payload._id,
        gs_app_id: payload.metaData.gs_app_id,
        created_at: new Date(payload.createdAt),
        processed_at: new Date(),
      };

      const exists = await this.collection.findOne({ message_id: doc.message_id });
      if (exists) {
        console.log(`📝 Skipping duplicate: ${doc.message_id}`);
        continue;
      }
      await this.collection.insertOne(doc);
      console.log(`✅ Inserted message: ${doc.message_id}`);
    }
  }

  async processStatusPayload(payload) {
    const value = payload.metaData.entry[0].changes[0].value;
    for (const status of value.statuses) {
      const update = {
        status: status.status,
        status_timestamp: new Date(parseInt(status.timestamp) * 1000),
        conversation_id: status.conversation?.id,
        gs_id: status.gs_id,
        recipient_id: status.recipient_id,
        updated_at: new Date(),
      };

      const result = await this.collection.updateOne(
        { $or: [{ meta_msg_id: status.meta_msg_id }, { message_id: status.id }] },
        {
          $set: update,
          $setOnInsert: {
            message_id: status.id,
            meta_msg_id: status.meta_msg_id,
            wa_id: status.recipient_id,
            phone_number_id: value.metadata.phone_number_id,
            display_phone_number: value.metadata.display_phone_number,
            created_at: new Date(),
            processed_at: new Date(),
          },
        },
        { upsert: true }
      );

      if (result.matchedCount > 0) console.log(`✅ Updated status: ${status.status} -> ${status.id}`);
      else if (result.upsertedCount > 0) console.log(`✅ Upserted status record: ${status.status} -> ${status.id}`);
    }
  }

  async processAllPayloads(dir = process.env.PAYLOADS_DIR || './payloads') {
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
    console.log(`📁 Found ${files.length} JSON files`);
    for (const file of files) {
      const full = path.join(dir, file);
      console.log(`📄 Processing ${file}`);
      const content = await fs.readFile(full, 'utf8');
      await this.processPayload(JSON.parse(content));
    }
    console.log('🎉 Done');
  }
}

export default WhatsAppWebhookProcessor;

if (process.argv[1] && process.argv[1].endsWith('process-webhooks.js')) {
  (async () => {
    const p = new WhatsAppWebhookProcessor();
    try {
      await p.connect();
      await p.processAllPayloads();
    } catch (e) {
      console.error(e);
      process.exit(1);
    } finally {
      await p.disconnect();
    }
  })();
}
