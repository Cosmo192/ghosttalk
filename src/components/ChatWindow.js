import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatWindow.module.css';

function Message({ msg }) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`${styles.message} ${msg.mine ? styles.mine : styles.theirs}`}>
      <div className={styles.bubble}>
        <span className={styles.text}>{msg.text}</span>
        <span className={styles.time}>{time}</span>
      </div>
    </div>
  );
}

export default function ChatWindow({ peer, messages, onSend, isEncrypted }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [peer.id]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || !peer.online) return;
    onSend(text);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.window}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>{peer.username.slice(0, 2).toUpperCase()}</div>
          <div>
            <div className={styles.name}>{peer.username}</div>
            <div className={styles.status}>
              {peer.online ? (
                <><span className={styles.onlineDot} /> Online</>
              ) : (
                <><span className={styles.offlineDot} /> Offline</>
              )}
            </div>
          </div>
        </div>
        <div className={styles.encBadge}>
          {isEncrypted ? (
            <>🔐 <span>AES-256 + ECDH</span></>
          ) : (
            <>⟳ <span>Encrypting...</span></>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.startMsg}>
            <div className={styles.startIcon}>🔐</div>
            <p>This conversation is end-to-end encrypted.</p>
            <p className={styles.startSub}>No one else can read these messages — not even GhostTalk.</p>
          </div>
        )}
        {messages.map(msg => (
          <Message key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={`${styles.inputWrap} ${!peer.online ? styles.disabled : ''}`}>
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={peer.online ? `Message ${peer.username}...` : 'User is offline'}
            disabled={!peer.online}
            rows={1}
          />
          <button
            className={`${styles.sendBtn} ${input.trim() && peer.online ? styles.active : ''}`}
            onClick={handleSend}
            disabled={!input.trim() || !peer.online}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 8L2 2l2.5 6L2 14l12-6z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div className={styles.inputFooter}>
          <span>Enter to send · Shift+Enter for new line</span>
          {isEncrypted && <span className={styles.enc}>🔐 Encrypted</span>}
        </div>
      </div>
    </div>
  );
}
