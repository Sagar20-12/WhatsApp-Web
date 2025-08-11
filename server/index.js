import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.SOCKET_PORT || 4000;
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:8080';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const io = new SocketIOServer(server, {
  cors: {
    // In dev, allow any origin (or set CLIENT_ORIGIN/CLIENT_ORIGINS in .env for stricter control)
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// CORS: allow localhost and network IPs during development
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl) or any origin in dev
      if (!origin) return callback(null, true);
      // Accept localhost and common LAN IPs in dev
      const localRegex = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
      const lanRegex = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/;
      if (origin === clientOrigin || localRegex.test(origin) || lanRegex.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

// --- Email (OTP) helpers ---
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

let mailTransporter = null;
if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  mailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail(toEmail, otp) {
  const subject = 'Your WhatsApp Web login code';
  const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
  if (!mailTransporter) {
    throw new Error('SMTP mailer not configured');
  }
  await mailTransporter.sendMail({
    from: SMTP_FROM,
    to: toEmail,
    subject,
    text,
  });
}

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Authentication routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    if (!usersCollection) {
      return res.status(503).json({
        message: 'Database not connected. Check MONGODB_URI, Atlas DB user credentials, and IP Access List.',
      });
    }
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(user);
    const userId = result.insertedId.toString();

    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        name,
        email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    if (!usersCollection) {
      return res.status(503).json({
        message: 'Database not connected. Check MONGODB_URI, Atlas DB user credentials, and IP Access List.',
      });
    }
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id.toString(), email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Request an OTP for email-based signup/signin
app.post('/api/auth/otp/request', async (req, res) => {
  try {
    if (!usersCollection) {
      return res.status(503).json({
        message: 'Database not connected. Check MONGODB_URI, Atlas DB user credentials, and IP Access List.',
      });
    }
    if (!mailTransporter) {
      return res.status(503).json({
        message: 'Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM in your environment.',
      });
    }

    const { email, name } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert user with OTP fields
    const existing = await usersCollection.findOne({ email });
    if (existing) {
      await usersCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            otpHash,
            otpExpiresAt,
            // populate name if previously missing
            ...(name && !existing.name ? { name } : {}),
          },
          $setOnInsert: { createdAt: new Date() },
        }
      );
    } else {
      await usersCollection.insertOne({
        name: name || email.split('@')[0],
        email,
        password: null,
        createdAt: new Date(),
        otpHash,
        otpExpiresAt,
      });
    }

    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP sent to email.' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify an OTP and issue JWT
app.post('/api/auth/otp/verify', async (req, res) => {
  try {
    if (!usersCollection) {
      return res.status(503).json({
        message: 'Database not connected. Check MONGODB_URI, Atlas DB user credentials, and IP Access List.',
      });
    }

    const { email, otp, name } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    let user = await usersCollection.findOne({ email });
    if (!user) {
      // Allow just-in-time creation if request happened elsewhere
      const otpHash = await bcrypt.hash(otp, 10); // will not be used if compare fails
      const now = new Date();
      const result = await usersCollection.insertOne({
        name: name || email.split('@')[0],
        email,
        password: null,
        createdAt: now,
        otpHash,
        otpExpiresAt: new Date(now.getTime() - 1), // immediately expired; forces compare to fail unless a request was made
      });
      user = { _id: result.insertedId, email, name: name || email.split('@')[0] };
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'No active OTP. Please request a new code.' });
    }
    if (new Date(user.otpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new code.' });
    }

    const isValid = await bcrypt.compare(otp, user.otpHash);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear OTP fields and update optional name
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $unset: { otpHash: '', otpExpiresAt: '' },
        ...(name && !user.name ? { $set: { name } } : {}),
      }
    );

    const userId = user._id.toString();
    const token = jwt.sign({ userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'OTP verified',
      token,
      user: { id: userId, name: user.name || name || email.split('@')[0], email: user.email },
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    if (!usersCollection) {
      return res.status(503).json({
        message: 'Database not connected. Check MONGODB_URI, Atlas DB user credentials, and IP Access List.',
      });
    }
    const user = await usersCollection.findOne({ _id: new ObjectId(req.user.userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

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


