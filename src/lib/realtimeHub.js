import { supabase } from './supabase';
import { Peer } from 'peerjs';

// Triple-Engine Realtime Hub (PeerJS WebRTC Mesh + Native BroadcastChannel + Supabase)
class RealtimeHub {
  constructor() {
    this.channel = null;
    this.broadcastChannel = null;
    this.peer = null;
    this.peerConns = new Map();
    this.chatListeners = new Set();
    this.activityListeners = new Set();
    this.myPeerId = 'onyis_peer_' + Math.random().toString(36).substring(2, 9);
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    // 1. Web API BroadcastChannel
    try {
      this.broadcastChannel = new BroadcastChannel('onyis_realtime_hub_v3');
      this.broadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'CHAT_MESSAGE') this.notifyChat(payload);
        else if (type === 'ACTIVITY_EVENT') this.notifyActivity(payload);
      };
    } catch (e) {}

    // 2. Storage event listener for window sync
    window.addEventListener('storage', (e) => {
      if (e.key === 'onyis_broadcast_chat_v3' && e.newValue) {
        try { this.notifyChat(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'onyis_broadcast_activity_v3' && e.newValue) {
        try { this.notifyActivity(JSON.parse(e.newValue)); } catch (err) {}
      }
    });

    // 3. PeerJS WebRTC Cross-Browser / Cross-Incognito Mesh Network
    try {
      this.peer = new Peer(this.myPeerId, { debug: 0 });
      
      this.peer.on('open', () => {
        this.connectToPeerRoom();
      });

      this.peer.on('connection', (conn) => {
        this.bindPeerConn(conn);
      });
    } catch (err) {
      console.warn('PeerJS realtime mesh init notice:', err);
    }

    // 4. Supabase Realtime Channel
    if (supabase) {
      try {
        this.channel = supabase.channel('room:onyis_global_v3', {
          config: { broadcast: { self: true } }
        });

        this.channel.on('broadcast', { event: 'CHAT_MESSAGE' }, ({ payload }) => {
          this.notifyChat(payload);
        });

        this.channel.on('broadcast', { event: 'ACTIVITY_EVENT' }, ({ payload }) => {
          this.notifyActivity(payload);
        });

        this.channel.subscribe();
      } catch (err) {}
    }
  }

  bindPeerConn(conn) {
    conn.on('open', () => {
      this.peerConns.set(conn.peer, conn);
    });

    conn.on('data', (data) => {
      if (!data || !data.type) return;
      if (data.type === 'CHAT_MESSAGE') this.notifyChat(data.payload);
      else if (data.type === 'ACTIVITY_EVENT') this.notifyActivity(data.payload);
    });

    const cleanup = () => this.peerConns.delete(conn.peer);
    conn.on('close', cleanup);
    conn.on('error', cleanup);
  }

  connectToPeerRoom() {
    const anchors = ['onyis_mesh_anchor_1', 'onyis_mesh_anchor_2', 'onyis_mesh_anchor_3'];
    anchors.forEach(anchorId => {
      if (this.peer && !this.peer.destroyed && anchorId !== this.myPeerId) {
        try {
          const conn = this.peer.connect(anchorId);
          this.bindPeerConn(conn);
        } catch (e) {}
      }
    });
  }

  onChat(callback) {
    this.chatListeners.add(callback);
    return () => this.chatListeners.delete(callback);
  }

  onActivity(callback) {
    this.activityListeners.add(callback);
    return () => this.activityListeners.delete(callback);
  }

  notifyChat(payload) {
    if (!payload || !payload.id) return;
    this.chatListeners.forEach(cb => { try { cb(payload); } catch (e) {} });
  }

  notifyActivity(payload) {
    if (!payload || !payload.id) return;
    this.activityListeners.forEach(cb => { try { cb(payload); } catch (e) {} });
  }

  sendChatMessage(msgPayload) {
    // A. Local Listeners
    this.notifyChat(msgPayload);

    // B. Native Web API BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'CHAT_MESSAGE', payload: msgPayload });
      } catch (e) {}
    }

    // C. LocalStorage Cross-Window Event
    try {
      localStorage.setItem('onyis_broadcast_chat_v3', JSON.stringify({ ...msgPayload, _ts: Date.now() }));
    } catch (e) {}

    // D. PeerJS WebRTC P2P DataChannel (Cross-Incognito & Cross-Device)
    this.peerConns.forEach(conn => {
      if (conn && conn.open) {
        try { conn.send({ type: 'CHAT_MESSAGE', payload: msgPayload }); } catch (e) {}
      }
    });

    // E. Supabase Realtime Broadcast
    if (this.channel) {
      try {
        this.channel.send({
          type: 'broadcast',
          event: 'CHAT_MESSAGE',
          payload: msgPayload
        });
      } catch (e) {}
    }

    // F. Persist to Supabase DB (if available)
    if (supabase) {
      supabase.from('global_chat').insert([{
        username: msgPayload.user,
        badge: msgPayload.badge || 'VIP',
        message: msgPayload.text,
        color: msgPayload.color || '#E5C158'
      }]).then(() => {}).catch(() => {});
    }
  }

  sendActivityEvent(activityPayload) {
    // A. Local Listeners
    this.notifyActivity(activityPayload);

    // B. Native Web API BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'ACTIVITY_EVENT', payload: activityPayload });
      } catch (e) {}
    }

    // C. LocalStorage Cross-Window Event
    try {
      localStorage.setItem('onyis_broadcast_activity_v3', JSON.stringify({ ...activityPayload, _ts: Date.now() }));
    } catch (e) {}

    // D. PeerJS WebRTC P2P DataChannel (Cross-Incognito & Cross-Device)
    this.peerConns.forEach(conn => {
      if (conn && conn.open) {
        try { conn.send({ type: 'ACTIVITY_EVENT', payload: activityPayload }); } catch (e) {}
      }
    });

    // E. Supabase Realtime Broadcast
    if (this.channel) {
      try {
        this.channel.send({
          type: 'broadcast',
          event: 'ACTIVITY_EVENT',
          payload: activityPayload
        });
      } catch (e) {}
    }
  }
}

export const realtimeHub = new RealtimeHub();
