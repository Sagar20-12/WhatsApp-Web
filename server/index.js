const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://whatsapp:Ssr20122002@vistagram.phcydle.mongodb.net/?retryWrites=true&w=majority&appName=Vistagram';
const DATABASE_NAME = 'whatsapp';
const COLLECTION_NAME = 'processed_messages';

let db = null;
let collection = null;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    collection = db.collection(COLLECTION_NAME);
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${DATABASE_NAME}`);
    console.log(`📝 Collection: ${COLLECTION_NAME}`);
    
    // Test the connection by counting documents
    const count = await collection.countDocuments();
    console.log(`📈 Found ${count} documents in collection`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.error('Please check your MongoDB URI and network connection');
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes

// Get all conversations
app.get('/api/conversations', async (req, res) => {
  try {
    if (!collection) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    // Aggregate conversations from messages
    const conversations = await collection.aggregate([
      {
        $group: {
          _id: '$conversation_id',
          lastMessage: { $last: '$message_body' },
          lastTimestamp: { $last: '$timestamp' },
          contactName: { $first: '$contact_name' },
          contactWaId: { $first: '$contact_wa_id' },
          phoneNumberId: { $first: '$phone_number_id' },
          messageCount: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'received'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          id: '$_id',
          name: '$contactName',
          lastMessage: '$lastMessage',
          timestamp: '$lastTimestamp',
          unreadCount: '$unreadCount',
          isOnline: { $literal: false }, // You could implement online status logic
          phoneNumber: '$contactWaId',
          conversationId: '$_id',
          messageCount: '$messageCount'
        }
      },
      {
        $sort: { timestamp: -1 }
      }
    ]).toArray();

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    if (!collection) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { conversationId } = req.params;
    
    const messages = await collection.find({
      conversation_id: conversationId
    })
    .sort({ timestamp: 1 })
    .project({
      id: '$message_id',
      text: '$message_body',
      timestamp: 1,
      isSent: { $eq: ['$from', '918329446654'] }, // Business number
      status: 1,
      from: 1,
      contactName: '$contact_name'
    })
    .toArray();

    // Convert timestamp to readable format
    const formattedMessages = messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
app.post('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    if (!collection) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const { conversationId } = req.params;
    const { text } = req.body;

    const newMessage = {
      message_id: `msg_${Date.now()}`,
      meta_msg_id: `msg_${Date.now()}`,
      from: '918329446654', // Business number
      to: conversationId,
      message_type: 'text',
      message_body: text,
      timestamp: Math.floor(Date.now() / 1000),
      status: 'sent',
      conversation_id: conversationId,
      created_at: new Date(),
      processed_at: new Date(),
      payload_source: 'api'
    };

    await collection.insertOne(newMessage);

    const responseMessage = {
      id: newMessage.message_id,
      text: newMessage.message_body,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isSent: true,
      status: 'sent',
      from: newMessage.from,
      contactName: 'Business'
    };

    res.json(responseMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get conversation statistics
app.get('/api/stats', async (req, res) => {
  try {
    if (!collection) {
      return res.status(500).json({ error: 'Database not connected' });
    }

    const stats = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          totalConversations: { $addToSet: '$conversation_id' },
          statusBreakdown: {
            $push: '$status'
          }
        }
      },
      {
        $project: {
          totalMessages: 1,
          totalConversations: { $size: '$totalConversations' },
          statusBreakdown: {
            sent: {
              $size: {
                $filter: {
                  input: '$statusBreakdown',
                  cond: { $eq: ['$$this', 'sent'] }
                }
              }
            },
            delivered: {
              $size: {
                $filter: {
                  input: '$statusBreakdown',
                  cond: { $eq: ['$$this', 'delivered'] }
                }
              }
            },
            read: {
              $size: {
                $filter: {
                  input: '$statusBreakdown',
                  cond: { $eq: ['$$this', 'read'] }
                }
              }
            }
          }
        }
      }
    ]).toArray();

    res.json(stats[0] || {
      totalMessages: 0,
      totalConversations: 0,
      statusBreakdown: { sent: 0, delivered: 0, read: 0 }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: collection ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  });
}

startServer().catch(console.error);


