import express from 'express';
import Channel from '../models/Channel.js';
import Message from '../models/Message.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const channels = await Channel.find().sort({ name: 1 });
    const userId = req.user._id;
    
    const channelsWithStatus = channels.map((channel) => ({
      ...channel.toObject(),
      joined: req.user.joinedChannels.includes(channel._id),
    }));
    
    res.json({ channels: channelsWithStatus });
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

    // Auto-join the creator
    req.user.joinedChannels.push(channel._id);
    await req.user.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('channel_created', { channel });
    }

    res.status(201).json({ channel: { ...channel.toObject(), joined: true } });
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

router.post('/:channelId/join', async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (req.user.joinedChannels.includes(channelId)) {
      return res.status(400).json({ error: 'Already joined this channel' });
    }

    req.user.joinedChannels.push(channelId);
    await req.user.save();

    res.json({ message: 'Joined channel successfully', channel });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to join channel' });
  }
});

router.post('/:channelId/leave', async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    const index = req.user.joinedChannels.indexOf(channelId);
    if (index === -1) {
      return res.status(400).json({ error: 'Not a member of this channel' });
    }

    req.user.joinedChannels.splice(index, 1);
    await req.user.save();

    res.json({ message: 'Left channel successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to leave channel' });
  }
});

export default router;
