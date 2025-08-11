import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.SOCKET_PORT || 4000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:8080';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const io = new SocketIOServer(server, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: clientOrigin }));
app.get('/health', (_req, res) => res.json({ ok: true }));

// MongoDB setup
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DATABASE || 'whatsapp';
const mongoCollectionName = process.env.MONGODB_COLLECTION || 'processed_messages';
let mongoClient;
let messagesCollection;
let usersCollection;

async function connectMongo() {
  try {
    if (!mongoUri) {
      console.error('MONGODB_URI not set in environment. Skipping DB connection.');
      return;
    }
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const db = mongoClient.db(mongoDbName);
    messagesCollection = db.collection(mongoCollectionName);
    usersCollection = db.collection('users');
    
    // Ensure indexes
    await messagesCollection.createIndex({ message_id: 1 }, { unique: false });
    await messagesCollection.createIndex({ conversation_id: 1 });
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    
    console.log(`Connected to MongoDB → ${mongoDbName}`);
    console.log(`Messages collection: ${mongoCollectionName}`);
    console.log(`Users collection: users`);
  } catch (err) {
    console.error('Failed to connect to MongoDB for socket server:', err);
  }
}

connectMongo();

io.on('connection', (socket) => {
  // Join a room per conversation/contact
  socket.on('join', (roomId) => {
    socket.join(roomId);
  });

  // Broadcast message to room
  socket.on('message', async ({ roomId, message }) => {
    // Persist to DB (best-effort)
    try {
      if (messagesCollection) {
        const now = new Date();
        const doc = {
          source: 'demo',
          direction: 'outbound',
          type: 'text',
          body: message?.text ?? '',
          message_id: message?.id ?? String(Date.now()),
          conversation_id: roomId,
          timestamp: now.toISOString(),
          created_at: now,
          status: 'sent',
        };
        await messagesCollection.insertOne(doc);
      }
    } catch (err) {
      console.error('Failed to persist message:', err);
    }
    // Emit to everyone else in the room except the sender
    socket.to(roomId).emit('message', message);
  });

  socket.on('typing', ({ roomId, typing }) => {
    socket.to(roomId).emit('typing', { typing });
  });
});

server.listen(port, () => {
  console.log(`Socket.IO server listening on :${port}`);
});


