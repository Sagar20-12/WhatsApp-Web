# WhatsApp Business API Webhook Processor

This directory contains scripts to process WhatsApp Business API webhook payloads and store them in MongoDB.

## 📁 Files

- `process-webhooks.js` - Basic webhook processor
- `enhanced-webhook-processor.js` - Enhanced processor with better error handling and features
- `config.js` - Configuration file for database and processing settings
- `README.md` - This documentation file

## 🚀 Quick Start

### Prerequisites

1. **MongoDB** - Make sure MongoDB is running locally or update the connection string
2. **Node.js** - Version 14 or higher
3. **Dependencies** - Install required packages:
   ```bash
   npm install mongodb
   ```

### Basic Usage

1. **Extract the payload files** (if not already done):
   ```bash
   # On Windows PowerShell
   Expand-Archive -Path "whatsapp sample payloads.zip" -DestinationPath "./payloads" -Force
   
   # On Linux/Mac
   unzip "whatsapp sample payloads.zip" -d ./payloads
   ```

2. **Run the basic processor**:
   ```bash
   npm run process-webhooks
   ```

3. **Run the enhanced processor**:
   ```bash
   npm run process-webhooks:enhanced
   ```

## 📊 Database Schema

The processor creates documents in the `processed_messages` collection with the following structure:

### Message Document
```json
{
  "_id": "ObjectId",
  "message_id": "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=",
  "meta_msg_id": "wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=",
  "wa_id": "919937320320",
  "contact_name": "Ravi Kumar",
  "message_type": "text",
  "message_body": "Hi, I'd like to know more about your services.",
  "timestamp": "2025-08-06T12:00:00.000Z",
  "status": "received",
  "phone_number_id": "629305560276479",
  "display_phone_number": "918329446654",
  "conversation_id": "conv1-msg1-user",
  "gs_app_id": "conv1-app",
  "created_at": "2025-08-06T12:00:00.000Z",
  "processed_at": "2025-08-06T12:00:01.000Z",
  "raw_payload": { /* Original webhook payload */ }
}
```

### Status Updates
When status webhooks are processed, the following fields are updated:
- `status`: "sent", "delivered", "read", "failed"
- `status_timestamp`: When the status was updated
- `conversation_id`: Conversation identifier
- `gs_id`: Google Sheets ID (if applicable)
- `recipient_id`: Recipient's WhatsApp ID
- `updated_at`: When the document was last updated

## ⚙️ Configuration

Edit `config.js` to customize the processor behavior:

### MongoDB Configuration
```javascript
mongodb: {
  uri: 'mongodb://localhost:27017',
  database: 'whatsapp',
  collection: 'processed_messages'
}
```

### Processing Configuration
```javascript
processing: {
  payloadsDirectory: './payloads',
  supportedFileExtensions: ['.json'],
  batchSize: 10,
  retryAttempts: 3
}
```

### Environment Variables
You can also use environment variables:
```bash
export MONGODB_URI="mongodb://localhost:27017"
export MONGODB_DATABASE="whatsapp"
export MONGODB_COLLECTION="processed_messages"
export PAYLOADS_DIR="./payloads"
export LOG_LEVEL="info"
```

## 🔧 Features

### Basic Processor (`process-webhooks.js`)
- ✅ Process message webhooks
- ✅ Process status webhooks
- ✅ Insert messages into MongoDB
- ✅ Update message statuses
- ✅ Basic error handling
- ✅ Duplicate detection

### Enhanced Processor (`enhanced-webhook-processor.js`)
- ✅ All basic features
- ✅ Batch processing
- ✅ Detailed statistics
- ✅ Better error handling
- ✅ Support for multiple message types
- ✅ Conversation tracking
- ✅ Cleanup utilities
- ✅ Performance monitoring

## 📈 Usage Examples

### Process All Payloads
```javascript
const processor = new EnhancedWhatsAppWebhookProcessor();
await processor.connect();
await processor.processAllPayloads();
await processor.getMessageStats();
await processor.disconnect();
```

### Get Recent Messages
```javascript
const messages = await processor.getRecentMessages(10);
```

### Get Conversation Messages
```javascript
const messages = await processor.getConversationMessages('conv1-msg1-user');
```

### Cleanup Old Messages
```javascript
const deletedCount = await processor.cleanupOldMessages(30); // Keep last 30 days
```

## 🔍 Database Queries

### Find Messages by Status
```javascript
db.processed_messages.find({ status: "read" })
```

### Find Messages by Contact
```javascript
db.processed_messages.find({ wa_id: "919937320320" })
```

### Find Messages in Date Range
```javascript
db.processed_messages.find({
  timestamp: {
    $gte: new Date("2025-08-06"),
    $lt: new Date("2025-08-07")
  }
})
```

### Get Message Statistics
```javascript
db.processed_messages.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
])
```

## 🚨 Error Handling

The processor handles various error scenarios:
- **Duplicate messages**: Skips processing if message already exists
- **Invalid JSON**: Logs error and continues with next file
- **Database connection issues**: Retries with exponential backoff
- **Missing fields**: Uses default values where possible

## 📝 Logging

The processor provides detailed logging:
- ✅ Connection status
- ✅ File processing progress
- ✅ Message insertion/updates
- ✅ Error details
- ✅ Processing statistics
- ✅ Performance metrics

## 🔒 Security Considerations

- Store MongoDB credentials securely
- Use environment variables for sensitive data
- Implement proper access controls
- Consider data encryption for sensitive messages
- Regular backup of processed data

## 🚀 Deployment

### Local Development
```bash
npm run process-webhooks:enhanced
```

### Production
```bash
# Set environment variables
export NODE_ENV=production
export MONGODB_URI="mongodb://your-production-db:27017"

# Run processor
npm run process-webhooks:enhanced
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "process-webhooks:enhanced"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
