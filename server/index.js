import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Channel from './models/Channel.js';

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
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/discord-clone';

app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Connected to MongoDB');
    await seedChannels();
    console.log('Default channels ready');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();
