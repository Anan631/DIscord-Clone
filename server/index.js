import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Channel from './models/Channel.js';
import authRoutes from './routes/auth.js';
import channelRoutes from './routes/channels.js';
import { socketAuth } from './middleware/auth.js';
import { setupSocket } from './socket/handler.js';

dotenv.config();

const DEFAULT_CHANNELS = [
  { name: 'general', description: 'General discussion for everyone' },
  { name: 'random', description: 'Off-topic and fun conversations' },
  { name: 'help', description: 'Ask questions and get help' },
];

async function seedChannels() {
  for (const channel of DEFAULT_CHANNELS) {
    await Channel.findOneAndUpdate(
      { name: channel.name },
      { $setOnInsert: channel },
      { upsert: true, new: true }
    );
  }
}

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/discord-clone';

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);

io.use(socketAuth);
setupSocket(io);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB');
    await seedChannels();
    console.log('Default channels ready');

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();
