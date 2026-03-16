import React, { useState, useEffect, useCallback } from 'react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import EmptyState from './components/EmptyState';
import styles from './App.module.css';

export default function App() {
  const [peers, setPeers] = useState([]);
  const [activePeerId, setActivePeerId] = useState(null);
  const [conversations, setConversations] = useState({});
  const [encryptedPeers, setEncryptedPeers] = useState(new Set());

  useEffect(() => {
    const gt = window.ghosttalk;
    if (!gt) return;

    gt.onPeerDiscovered((peer) => {
      setPeers(prev => {
        if (prev.find(p => p.id === peer.id)) return prev;
        return [...prev, { ...peer, online: true }];
      });
    });

    gt.onPeerLeft((peer) => {
      setPeers(prev => prev.map(p =>
        p.id === peer.id ? { ...p, online: false } : p
      ));
    });

    gt.onKeyExchanged(({ id }) => {
      setEncryptedPeers(prev => new Set([...prev, id]));
    });

    gt.onMessageReceived((msg) => {
      setConversations(prev => ({
        ...prev,
        [msg.from]: [...(prev[msg.from] || []), {
          id: Date.now() + Math.random(),
          from: msg.from,
          username: msg.username,
          text: msg.text,
          timestamp: msg.timestamp,
          mine: false,
        }],
      }));
    });

    return () => {
      ['peer-discovered', 'peer-left', 'key-exchanged', 'message-received']
        .forEach(ch => gt.removeAllListeners(ch));
    };
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!activePeerId || !text.trim()) return;
    const result = await window.ghosttalk?.sendMessage(activePeerId, text);
    if (result?.success) {
      setConversations(prev => ({
        ...prev,
        [activePeerId]: [...(prev[activePeerId] || []), {
          id: Date.now() + Math.random(),
          from: 'me',
          text,
          timestamp: Date.now(),
          mine: true,
        }],
      }));
    }
  }, [activePeerId]);

  const activePeer = peers.find(p => p.id === activePeerId);
  const messages = activePeerId ? (conversations[activePeerId] || []) : [];
  const isEncrypted = encryptedPeers.has(activePeerId);

  return (
    <div className={styles.app}>
      <TitleBar />
      <div className={styles.body}>
        <Sidebar
          peers={peers}
          activePeerId={activePeerId}
          onSelectPeer={setActivePeerId}
          conversations={conversations}
          encryptedPeers={encryptedPeers}
        />
        <main className={styles.main}>
          {activePeer ? (
            <ChatWindow
              peer={activePeer}
              messages={messages}
              onSend={sendMessage}
              isEncrypted={isEncrypted}
            />
          ) : (
            <EmptyState peersCount={peers.length} />
          )}
        </main>
      </div>
    </div>
  );
}
