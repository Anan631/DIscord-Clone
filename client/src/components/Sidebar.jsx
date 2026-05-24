import { useState } from 'react';

export default function Sidebar({
  channels,
  activeChannel,
  onSelectChannel,
  onCreateChannel,
  onJoinChannel,
  onLeaveChannel,
  user,
  onLogout,
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [joiningId, setJoiningId] = useState(null);
  const [leavingId, setLeavingId] = useState(null);

  const joinedChannels = channels.filter((c) => c.joined);
  const availableChannels = channels.filter((c) => !c.joined);

  const filteredJoined = joinedChannels.filter((channel) =>
    channel.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const filteredAvailable = availableChannels.filter((channel) =>
    channel.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      await onCreateChannel(newName, newDesc);
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create channel');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e, channelId) => {
    e.stopPropagation();
    setJoiningId(channelId);
    try {
      await onJoinChannel(channelId);
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (e, channelId) => {
    e.stopPropagation();
    setLeavingId(channelId);
    try {
      await onLeaveChannel(channelId);
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Channels</h2>
        <button
          type="button"
          className="btn-icon"
          title="Create channel"
          onClick={() => setShowCreate(!showCreate)}
        >
          +
        </button>
      </div>

      <div className="channel-search">
        <input
          type="text"
          placeholder="Search channels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showCreate && (
        <form className="create-channel-form" onSubmit={handleCreate}>
          {error && <div className="form-error small">{error}</div>}
          <input
            type="text"
            placeholder="channel-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <div className="create-actions">
            <button type="submit" className="btn-small" disabled={creating}>
              {creating ? '...' : 'Create'}
            </button>
            <button
              type="button"
              className="btn-small btn-ghost"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <nav className="channel-list">
        {filteredJoined.length === 0 && filteredAvailable.length === 0 && search && (
          <p className="channel-list-empty">No channels match &quot;{search}&quot;</p>
        )}

        {filteredJoined.length > 0 && (
          <>
            <div className="channel-group-label">Joined</div>
            {filteredJoined.map((channel) => (
              <div
                key={channel._id}
                className={`channel-item-wrapper ${activeChannel?._id === channel._id ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="channel-item"
                  onClick={() => onSelectChannel(channel)}
                >
                  <span className="channel-hash">#</span>
                  {channel.name}
                </button>
                <button
                  type="button"
                  className="btn-channel-action"
                  onClick={(e) => handleLeave(e, channel._id)}
                  disabled={leavingId === channel._id}
                  title="Leave channel"
                >
                  ✕
                </button>
              </div>
            ))}
          </>
        )}

        {filteredAvailable.length > 0 && (
          <>
            <div className="channel-group-label">Browse</div>
            {filteredAvailable.map((channel) => (
              <div key={channel._id} className="channel-item-wrapper">
                <button
                  type="button"
                  className="channel-item channel-unavailable"
                  disabled
                >
                  <span className="channel-hash">#</span>
                  {channel.name}
                </button>
                <button
                  type="button"
                  className="btn-channel-action btn-join"
                  onClick={(e) => handleJoin(e, channel._id)}
                  disabled={joiningId === channel._id}
                  title="Join channel"
                >
                  {joiningId === channel._id ? '...' : '+'}
                </button>
              </div>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-avatar">{user.username[0].toUpperCase()}</span>
          <span className="user-name">{user.username}</span>
        </div>
        <button type="button" className="btn-logout" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </aside>
  );
}
