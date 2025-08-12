# WhatsApp Payload Processor

This script processes WhatsApp webhook payloads and stores them in MongoDB. It handles both message payloads and status updates.

## Features

- ✅ **Message Processing**: Extracts and stores incoming WhatsApp messages
- ✅ **Status Updates**: Updates message status (sent, delivered, read) based on status payloads
- ✅ **Duplicate Prevention**: Prevents duplicate message insertions
- ✅ **Database Indexing**: Creates optimized indexes for better performance
- ✅ **Comprehensive Logging**: Detailed console output for monitoring
- ✅ **Error Handling**: Robust error handling and recovery

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or accessible via connection string)
3. **WhatsApp payload files** in the `../payloads/` directory

## Installation

1. Navigate to the scripts directory:
   ```bash
   cd scripts
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### MongoDB Connection

The script uses the following MongoDB configuration:

- **Database**: `whatsapp`
- **Collection**: `processed_messages`
- **Connection**: `mongodb://localhost:27017` (default)

You can override the MongoDB connection string using environment variables:

```bash
export MONGODB_URI="mongodb://your-mongodb-host:27017"
```

## Usage

### Basic Usage

Run the script to process all payload files:

```bash
npm start
```

or

```bash
node process-whatsapp-payloads.js
```

### Programmatic Usage

You can also use the processor in your own code:

```javascript
const WhatsAppPayloadProcessor = require('./process-whatsapp-payloads');

async function customProcessing() {
  const processor = new WhatsAppPayloadProcessor();
  
  try {
    await processor.connect();
    await processor.processAllPayloads();
  } finally {
    await processor.disconnect();
  }
}
```

## Payload Structure

### Message Payloads

The script expects message payloads with the following structure:

```json
{
  "payload_type": "whatsapp_webhook",
  "_id": "unique-id",
  "metaData": {
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "contacts": [{
            "profile": { "name": "Contact Name" },
            "wa_id": "phone-number"
          }],
          "messages": [{
            "from": "phone-number",
            "id": "message-id",
            "timestamp": "timestamp",
            "text": { "body": "message content" },
            "type": "text"
          }],
          "metadata": {
            "display_phone_number": "business-number",
            "phone_number_id": "phone-id"
          }
        }
      }]
    }]
  }
}
```

### Status Payloads

Status payloads should have this structure:

```json
{
  "payload_type": "whatsapp_webhook",
  "metaData": {
    "entry": [{
      "changes": [{
        "field": "messages",
        "value": {
          "statuses": [{
            "id": "message-id",
            "meta_msg_id": "message-id",
            "status": "sent|delivered|read",
            "timestamp": "timestamp",
            "recipient_id": "phone-number"
          }]
        }
      }]
    }]
  }
}
```

## Database Schema

### Message Document Structure

```javascript
{
  _id: ObjectId,
  message_id: String,           // WhatsApp message ID
  meta_msg_id: String,          // Meta message ID (same as message_id for messages)
  from: String,                 // Sender phone number
  to: String,                   // Business phone number
  phone_number_id: String,      // WhatsApp phone number ID
  contact_name: String,         // Contact display name
  contact_wa_id: String,        // Contact WhatsApp ID
  message_type: String,         // Message type (text, image, etc.)
  message_body: String,         // Message content
  timestamp: Number,            // Unix timestamp
  status: String,               // Message status (received, sent, delivered, read)
  conversation_id: String,      // Conversation identifier
  gs_app_id: String,            // GS App ID
  gs_id: String,                // GS ID (from status updates)
  created_at: Date,             // Original creation time
  processed_at: Date,           // Processing timestamp
  status_updated_at: Date,      // Last status update time
  last_status_timestamp: Number, // Last status timestamp
  payload_source: String        // Source payload type
}
```

## Database Indexes

The script automatically creates the following indexes for optimal performance:

- `message_id` (unique)
- `meta_msg_id`
- `status`
- `processed_at`
- `conversation_id`

## Output

The script provides detailed console output including:

- 📁 Number of payload files found
- 📄 Processing status for each file
- ✅ Successful operations
- ⚠️ Warnings (duplicates, missing messages)
- ❌ Error messages
- 📊 Processing summary with statistics
- 📝 Recent messages preview

### Example Output

```
📁 Found 8 payload files

🚀 Starting payload processing...

📄 Processing conversation_1_message_1.json (message)
✅ Inserted message: wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=

📄 Processing conversation_1_status_1.json (status)
✅ Updated status for message wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=: read

✅ All payloads processed successfully!

📊 Processing Summary:
Total messages in collection: 4
Status breakdown:
  received: 2
  read: 2

📝 Recent messages:
  wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggNDc4NzZBQ0YxMjdCQ0VFOTk2NzA3MTI4RkZCNjYyMjc=: read - "Thank you for your inquiry. We'd be happy to help..."
```

## Error Handling

The script includes comprehensive error handling:

- **Connection Errors**: MongoDB connection failures
- **File Errors**: Missing or corrupted payload files
- **Parsing Errors**: Invalid JSON in payload files
- **Database Errors**: Insert/update operation failures
- **Validation Errors**: Missing required fields in payloads

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in environment variables
   - Verify network connectivity

2. **Payload Files Not Found**
   - Ensure payload files are in the `../payloads/` directory
   - Check file permissions

3. **Duplicate Key Errors**
   - The script handles duplicates automatically
   - Check if messages already exist in the database

4. **Status Updates Not Working**
   - Verify `meta_msg_id` matches between message and status payloads
   - Check if the original message exists in the database

### Debug Mode

For detailed debugging, you can modify the script to include more verbose logging or add console.log statements in specific methods.

## Contributing

To extend the script functionality:

1. Add new payload type handlers in `getPayloadType()` method
2. Create new extraction methods for different payload structures
3. Extend the database schema as needed
4. Add new indexes for better query performance

## License

MIT License - see LICENSE file for details.
