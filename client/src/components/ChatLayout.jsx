import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getChannels, createChannel, joinChannel, leaveChannel } from '../api';
import { getSocket } from '../socket';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

export default function ChatLayout() {
  const { user, logout } = useAuth();
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadChannels = async () => {
    try {
      const { data } = await getChannels();
      setChannels(data.channels);
      // Set active channel to first joined channel, or null if no joined channels
      const firstJoinedChannel = data.channels.find((c) => c.joined);
      setActiveChannel((current) => current || firstJoinedChannel || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onChannelCreated = ({ channel }) => {
      setChannels((prev) => {
        if (prev.some((c) => c._id === channel._id)) return prev;
        return [...prev, { ...channel, joined: false }].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });
    };

    socket.on('channel_created', onChannelCreated);
    return () => socket.off('channel_created', onChannelCreated);
  }, []);

  const handleCreateChannel = async (name, description) => {
    const { data } = await createChannel({ name, description });
    setChannels((prev) =>
      [...prev, data.channel].sort((a, b) => a.name.localeCompare(b.name))
    );
    // Auto-select the newly created channel (user is auto-joined)
    setActiveChannel(data.channel);
  };

  const handleJoinChannel = async (channelId) => {
    try {
      await joinChannel(channelId);
      setChannels((prev) =>
        prev.map((c) => (c._id === channelId ? { ...c, joined: true } : c))
      );
      // Automatically switch to the newly joined channel
      const joinedChannel = channels.find((c) => c._id === channelId);
      if (joinedChannel) {
        setActiveChannel({ ...joinedChannel, joined: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join channel');
    }
  };

  const handleLeaveChannel = async (channelId) => {
    try {
      await leaveChannel(channelId);
      setChannels((prev) =>
        prev.map((c) => (c._id === channelId ? { ...c, joined: false } : c))
      );
      // If leaving the active channel, switch to another joined channel
      if (activeChannel?._id === channelId) {
        const firstJoinedChannel = channels.find(
          (c) => c._id !== channelId && c.joined
        );
        setActiveChannel(firstJoinedChannel || null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave channel');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading channels...</p>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <Sidebar
        channels={channels}
        activeChannel={activeChannel}
        onSelectChannel={setActiveChannel}
        onCreateChannel={handleCreateChannel}
        onJoinChannel={handleJoinChannel}
        onLeaveChannel={handleLeaveChannel}
        user={user}
        onLogout={logout}
      />
      {error && <div className="layout-error">{error}</div>}
      <ChatArea channel={activeChannel} user={user} />
    </div>
  );
}
