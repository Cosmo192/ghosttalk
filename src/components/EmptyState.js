import React from 'react';
import styles from './EmptyState.module.css';

export default function EmptyState({ peersCount }) {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>👻</div>
        <h1 className={styles.title}>GhostTalk</h1>
        <p className={styles.subtitle}>
          Encrypted. Offline. Untraceable.
        </p>
        <div className={styles.features}>
          <div className={styles.feature}>
            <span>🔐</span>
            <span>ECDH + AES-256 encryption</span>
          </div>
          <div className={styles.feature}>
            <span>📡</span>
            <span>Works on LAN — zero internet</span>
          </div>
          <div className={styles.feature}>
            <span>🚫</span>
            <span>No accounts, no servers, no logs</span>
          </div>
          <div className={styles.feature}>
            <span>🔑</span>
            <span>Keys never leave your device</span>
          </div>
        </div>
        {peersCount === 0 ? (
          <div className={styles.waiting}>
            <div className={styles.scanner} />
            <p>Scanning for peers on your network...</p>
          </div>
        ) : (
          <p className={styles.hint}>
            👈 Select a contact to start chatting
          </p>
        )}
      </div>
    </div>
  );
}
