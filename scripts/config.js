const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE || 'whatsapp',
    collection: process.env.MONGODB_COLLECTION || 'processed_messages',
    options: {
      // These options are safe to pass even in modern drivers
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    },
  },
  processing: {
    payloadsDirectory: process.env.PAYLOADS_DIR || './payloads',
    supportedFileExtensions: ['.json'],
    batchSize: 10,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: true,
    enableFile: false,
    logFile: './logs/webhook-processor.log',
  },
  whatsapp: {
    supportedMessageTypes: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact'],
    supportedStatusTypes: ['sent', 'delivered', 'read', 'failed'],
    defaultStatus: 'received',
  },
  indexes: [
    { key: { message_id: 1 }, unique: true },
    { key: { meta_msg_id: 1 } },
    { key: { wa_id: 1 } },
    { key: { timestamp: 1 } },
    { key: { status: 1 } },
    { key: { conversation_id: 1 } },
    { key: { created_at: 1 } },
  ],
};

export default config;
