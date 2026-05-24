import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getChannels, createChannel } from '../api';
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
      setActiveChannel((current) => current || data.channels[0] || null);
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
        return [...prev, channel].sort((a, b) => a.name.localeCompare(b.name));
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
    setActiveChannel(data.channel);
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
        user={user}
        onLogout={logout}
      />
      {error && <div className="layout-error">{error}</div>}
      <ChatArea channel={activeChannel} user={user} />
    </div>
  );
}
