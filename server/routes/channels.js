import express from 'express';
import Channel from '../models/Channel.js';
import Message from '../models/Message.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const channels = await Channel.find().sort({ name: 1 });
    res.json({ channels });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch channels' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = req.body.name?.trim().toLowerCase().replace(/\s+/g, '-');
    const description = req.body.description?.trim() || '';

    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Channel name must be at least 2 characters' });
    }

    const existing = await Channel.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'Channel already exists' });
    }

    const channel = await Channel.create({ name, description });
    res.status(201).json({ channel });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to create channel' });
  }
});

router.get('/:channelId/messages', async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

    const messages = await Message.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ messages: messages.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch messages' });
  }
});

export default router;
