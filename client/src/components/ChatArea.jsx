import { useState, useEffect, useRef } from 'react';
import { getMessages } from '../api';
import { getSocket } from '../socket';
import MessageInput from './MessageInput';

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatArea({ channel, user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!channel) {
      setMessages([]);
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    let cancelled = false;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const { data } = await getMessages(channel._id);
        if (!cancelled) {
          setMessages(data.messages);
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMessages();
    socket.emit('join_channel', channel._id);

    const onNewMessage = (msg) => {
      if (msg.channel === channel._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('new_message', onNewMessage);

    return () => {
      cancelled = true;
      socket.off('new_message', onNewMessage);
      socket.emit('leave_channel', channel._id);
    };
  }, [channel?._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, channel?._id]);

  const handleSend = (content) => {
    const socket = getSocket();
    if (!socket || !channel) return;
    socket.emit('send_message', { channelId: channel._id, content });
  };

  if (!channel) {
    return (
      <main className="chat-area empty">
        <p>Select a channel to start chatting</p>
      </main>
    );
  }

  return (
    <main className="chat-area">
      <header className="chat-header">
        <span className="channel-hash">#</span>
        <div>
          <h3>{channel.name}</h3>
          {channel.description && <p>{channel.description}</p>}
        </div>
      </header>

      <div className="messages-container">
        {loading ? (
          <div className="messages-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="messages-empty">
            <p>
              Welcome to <strong>#{channel.name}</strong>
            </p>
            <p>This is the start of the channel. Say hello!</p>
          </div>
        ) : (
          <ul className="message-list">
            {messages.map((msg) => (
              <li
                key={msg._id}
                className={`message ${String(msg.user) === String(user._id) ? 'own' : ''}`}
              >
                <div className="message-avatar">{msg.username[0].toUpperCase()}</div>
                <div className="message-body">
                  <div className="message-meta">
                    <span className="message-author">{msg.username}</span>
                    <span className="message-time">{formatTime(msg.createdAt)}</span>
                  </div>
                  <p className="message-content">{msg.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} channelName={channel.name} />
    </main>
  );
}
