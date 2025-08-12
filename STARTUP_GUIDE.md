# 🚀 WhatsApp Web Clone - Startup Guide

This guide will help you get the WhatsApp Web Clone running with your MongoDB Atlas database.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (already configured)

## 🔧 Step-by-Step Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Install script dependencies
cd scripts
npm install
cd ..
```

### 2. Test MongoDB Connection

First, let's verify your MongoDB Atlas connection:

```bash
cd scripts
npm run test-db
```

This will:
- Connect to your MongoDB Atlas database
- Check if the `whatsapp` database and `processed_messages` collection exist
- Show any existing data

**Expected Output:**
```
🧪 Testing MongoDB Connection...

🔌 Connecting to MongoDB...
✅ Connected successfully!
📊 Database: whatsapp
📝 Collection: processed_messages
📈 Total documents: 0

⚠️  No documents found in collection
💡 You may need to run the payload processor first:
   cd scripts && npm start
```

### 3. Process WhatsApp Payloads

If no documents are found, process your payload files:

```bash
cd scripts
npm start
```

This will:
- Read all JSON files from the `payloads/` directory
- Insert messages into MongoDB
- Update message statuses
- Show a summary of processed data

**Expected Output:**
```
📁 Found 8 payload files

🚀 Starting payload processing...

📄 Processing conversation_1_message_1.json (message)
✅ Inserted message: wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=

📄 Processing conversation_1_status_1.json (status)
✅ Updated status for message wamid.HBgMOTE5OTY3NTc4NzIwFQIAEhggMTIzQURFRjEyMzQ1Njc4OTA=: delivered

...

✅ All payloads processed successfully!

📊 Processing Summary:
Total messages in collection: 4
Status breakdown:
  received: 2
  delivered: 1
  read: 1
```

### 4. Start the Backend API Server

```bash
cd server
npm start
```

**Expected Output:**
```
🔌 Attempting to connect to MongoDB...
URI: mongodb+srv://***:***@vistagram.phcydle.mongodb.net/?retryWrites=true&w=majority&appName=Vistagram
✅ Connected to MongoDB successfully
📊 Database: whatsapp
📝 Collection: processed_messages
📈 Found 4 documents in collection
🚀 Server running on port 3001
📊 API available at http://localhost:3001/api
```

### 5. Start the Frontend Application

In a new terminal:

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 6. Test the Application

1. Open your browser and go to `http://localhost:3000`
2. You should see the WhatsApp interface
3. Check the browser console for any errors
4. The conversations should load from your MongoDB data

## 🔍 Troubleshooting

### MongoDB Connection Issues

If you see connection errors:

1. **Check Network**: Ensure you can access MongoDB Atlas
2. **Verify URI**: The connection string should be correct
3. **Check Credentials**: Username and password should be valid
4. **IP Whitelist**: Your IP should be whitelisted in MongoDB Atlas

### API Server Issues

If the server won't start:

1. **Check Port**: Ensure port 3001 is available
2. **Check Dependencies**: Run `npm install` in the server directory
3. **Check Logs**: Look for specific error messages

### Frontend Issues

If the UI shows no data:

1. **Check Console**: Open browser dev tools and check for errors
2. **Check API**: Visit `http://localhost:3001/api/health` in your browser
3. **Check Network**: Ensure the frontend can reach the backend

### Common Error Messages

**"MongoDB connection failed"**
- Check your internet connection
- Verify the MongoDB URI
- Ensure MongoDB Atlas is accessible

**"Failed to fetch conversations"**
- Make sure the API server is running
- Check if the server is on the correct port
- Verify CORS settings

**"No conversations found"**
- Run the payload processor first
- Check if data exists in MongoDB
- Verify the collection name

## 📊 Verification Steps

### 1. Check API Health
Visit: `http://localhost:3001/api/health`

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Check Conversations API
Visit: `http://localhost:3001/api/conversations`

Expected response:
```json
[
  {
    "id": "conv1-convo-id",
    "name": "Ravi Kumar",
    "lastMessage": "Hi, I'd like to know more about your services.",
    "timestamp": 1704110400,
    "unreadCount": 0,
    "isOnline": false,
    "phoneNumber": "919937320320",
    "conversationId": "conv1-convo-id",
    "messageCount": 2
  }
]
```

### 3. Check Browser Console
Open browser dev tools and look for:
- WhatsApp Service initialization
- API calls to conversations endpoint
- Any error messages

## 🎯 Success Indicators

You'll know everything is working when:

1. ✅ MongoDB connection test passes
2. ✅ Payload processor runs without errors
3. ✅ API server starts and shows connected status
4. ✅ Frontend loads without console errors
5. ✅ Conversations appear in the UI
6. ✅ You can click on conversations and see messages

## 🆘 Getting Help

If you're still having issues:

1. Check all console outputs for error messages
2. Verify each step in this guide
3. Ensure all services are running
4. Check network connectivity
5. Verify MongoDB Atlas settings

The system is designed to fall back to mock data if the API is unavailable, so you should always see some content in the UI.
