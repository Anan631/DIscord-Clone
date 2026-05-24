import Message from '../models/Message.js';
import Channel from '../models/Channel.js';
import User from '../models/User.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    const { username, _id: userId } = socket.user;

    socket.on('join_channel', async (channelId) => {
      try {
        const channel = await Channel.findById(channelId);
        if (!channel) {
          socket.emit('error', { message: 'Channel not found' });
          return;
        }

        // Check if user is a member of this channel
        const user = await User.findById(userId);
        if (!user.joinedChannels.includes(channelId)) {
          socket.emit('error', { message: 'You are not a member of this channel' });
          return;
        }

        if (socket.currentChannel) {
          socket.leave(socket.currentChannel);
        }

        socket.currentChannel = channelId;
        socket.join(channelId);
        socket.emit('joined_channel', { channelId, channelName: channel.name });
      } catch {
        socket.emit('error', { message: 'Failed to join channel' });
      }
    });

    socket.on('leave_channel', (channelId) => {
      socket.leave(channelId);
      if (socket.currentChannel === channelId) {
        socket.currentChannel = null;
      }
    });

    socket.on('send_message', async ({ channelId, content }) => {
      try {
        const trimmed = content?.trim();
        if (!trimmed) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        const channel = await Channel.findById(channelId);
        if (!channel) {
          socket.emit('error', { message: 'Channel not found' });
          return;
        }

        // Check if user is a member of this channel
        const user = await User.findById(userId);
        if (!user.joinedChannels.includes(channelId)) {
          socket.emit('error', { message: 'You are not a member of this channel' });
          return;
        }

        const message = await Message.create({
          channel: channelId,
          user: userId,
          username,
          content: trimmed,
        });

        const payload = {
          _id: message._id,
          channel: channelId,
          user: userId,
          username,
          content: message.content,
          createdAt: message.createdAt,
        };

        io.to(channelId).emit('new_message', payload);
      } catch {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
  });
};
