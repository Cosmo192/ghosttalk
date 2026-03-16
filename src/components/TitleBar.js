import React from 'react';
import styles from './TitleBar.module.css';

export default function TitleBar() {
  const gt = window.ghosttalk;

  return (
    <div className={styles.titlebar}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>👻</span>
          <span className={styles.logoText}>GhostTalk</span>
        </div>
        <div className={styles.badge}>
          <span className={styles.dot} />
          LAN ONLY
        </div>
      </div>
      <div className={styles.drag} />
      <div className={styles.controls}>
        <button className={styles.btn} onClick={() => gt?.minimize()} title="Minimize">
          <svg width="10" height="1" viewBox="0 0 10 1"><rect width="10" height="1" fill="currentColor"/></svg>
        </button>
        <button className={styles.btn} onClick={() => gt?.maximize()} title="Maximize">
          <svg width="10" height="10" viewBox="0 0 10 10"><rect width="9" height="9" x="0.5" y="0.5" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
        </button>
        <button className={`${styles.btn} ${styles.close}`} onClick={() => gt?.close()} title="Close">
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1.2"/>
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
