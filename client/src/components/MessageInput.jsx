import { useState } from 'react';

export default function MessageInput({ onSend, channelName }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setContent('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Message #${channelName}`}
        maxLength={2000}
        autoComplete="off"
      />
      <button type="submit" className="btn-send" disabled={!content.trim()}>
        Send
      </button>
    </form>
  );
}
