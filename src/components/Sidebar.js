import React from 'react';
import styles from './Sidebar.module.css';

function PeerItem({ peer, isActive, onClick, hasUnread, isEncrypted }) {
  const initials = peer.username.slice(0, 2).toUpperCase();
  return (
    <button
      className={`${styles.peerItem} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      <div className={styles.avatarWrap}>
        <div className={styles.avatar}>{initials}</div>
        <span className={`${styles.statusDot} ${peer.online ? styles.online : styles.offline}`} />
      </div>
      <div className={styles.peerInfo}>
        <div className={styles.peerName}>{peer.username}</div>
        <div className={styles.peerMeta}>
          {isEncrypted ? (
            <span className={styles.encTag}>🔐 E2E encrypted</span>
          ) : (
            <span className={styles.connectingTag}>⟳ Handshaking...</span>
          )}
        </div>
      </div>
      {hasUnread && <div className={styles.unread} />}
    </button>
  );
}

export default function Sidebar({ peers, activePeerId, onSelectPeer, conversations, encryptedPeers }) {
  const online = peers.filter(p => p.online);
  const offline = peers.filter(p => !p.online);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.headerLabel}>CONTACTS</span>
        <span className={styles.count}>{online.length} online</span>
      </div>

      <div className={styles.list}>
        {peers.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📡</div>
            <p>Scanning network...</p>
            <p className={styles.emptyHint}>Anyone on the same WiFi running GhostTalk will appear here</p>
          </div>
        )}

        {online.length > 0 && (
          <div className={styles.section}>
            {online.map(peer => (
              <PeerItem
                key={peer.id}
                peer={peer}
                isActive={activePeerId === peer.id}
                onClick={() => onSelectPeer(peer.id)}
                hasUnread={false}
                isEncrypted={encryptedPeers.has(peer.id)}
              />
            ))}
          </div>
        )}

        {offline.length > 0 && (
          <>
            <div className={styles.divider}>OFFLINE</div>
            <div className={styles.section}>
              {offline.map(peer => (
                <PeerItem
                  key={peer.id}
                  peer={peer}
                  isActive={activePeerId === peer.id}
                  onClick={() => onSelectPeer(peer.id)}
                  hasUnread={false}
                  isEncrypted={false}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          <span className={styles.footerDot} />
          <span>No internet required</span>
        </div>
      </div>
    </aside>
  );
}
