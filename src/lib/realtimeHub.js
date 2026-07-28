import { supabase } from './supabase';

// Unified Realtime Hub for Global Chat & Live Activity Ticker (Multi-Device & Cross-Browser Sync)
class RealtimeHub {
  constructor() {
    this.channel = null;
    this.broadcastChannel = null;
    this.chatListeners = new Set();
    this.activityListeners = new Set();
    this.init();
  }

  init() {
    // 1. Native Web API BroadcastChannel for local cross-tab / cross-window sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('onyis_realtime_hub_v2');
        this.broadcastChannel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'CHAT_MESSAGE') {
            this.notifyChat(payload);
          } else if (type === 'ACTIVITY_EVENT') {
            this.notifyActivity(payload);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel init notice:', e);
      }
    }

    // 2. Storage event listener for window sync fallback
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'onyis_last_broadcast_activity' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notifyActivity(data);
          } catch (err) {}
        } else if (e.key === 'onyis_last_broadcast_chat' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.notifyChat(data);
          } catch (err) {}
        }
      });
    }

    // 3. Supabase Realtime Global Broadcast Channel
    if (supabase) {
      try {
        this.channel = supabase.channel('room:onyis_global_v2', {
          config: { broadcast: { self: true } }
        });

        this.channel.on('broadcast', { event: 'CHAT_MESSAGE' }, ({ payload }) => {
          this.notifyChat(payload);
        });

        this.channel.on('broadcast', { event: 'ACTIVITY_EVENT' }, ({ payload }) => {
          this.notifyActivity(payload);
        });

        this.channel.subscribe((status) => {
          console.log('RealtimeHub Supabase subscription status:', status);
        });
      } catch (err) {
        console.warn('RealtimeHub Supabase init notice:', err);
      }
    }
  }

  // Subscribe to Global Chat updates
  onChat(callback) {
    this.chatListeners.add(callback);
    return () => this.chatListeners.delete(callback);
  }

  // Subscribe to Live Activity Ticker updates
  onActivity(callback) {
    this.activityListeners.add(callback);
    return () => this.activityListeners.delete(callback);
  }

  notifyChat(payload) {
    if (!payload || !payload.id) return;
    this.chatListeners.forEach(cb => {
      try { cb(payload); } catch (e) {}
    });
  }

  notifyActivity(payload) {
    if (!payload || !payload.id) return;
    this.activityListeners.forEach(cb => {
      try { cb(payload); } catch (e) {}
    });
  }

  // Broadcast a chat message to all connected devices & tabs
  sendChatMessage(msgPayload) {
    // A. Local Listeners
    this.notifyChat(msgPayload);

    // B. Native Web API BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'CHAT_MESSAGE', payload: msgPayload });
      } catch (e) {}
    }

    // C. LocalStorage Trigger
    try {
      localStorage.setItem('onyis_last_broadcast_chat', JSON.stringify({ ...msgPayload, _ts: Date.now() }));
    } catch (e) {}

    // D. Supabase Realtime Broadcast
    if (this.channel) {
      try {
        this.channel.send({
          type: 'broadcast',
          event: 'CHAT_MESSAGE',
          payload: msgPayload
        });
      } catch (e) {}
    }

    // E. Persist to Supabase Database
    if (supabase) {
      supabase.from('global_chat').insert([{
        username: msgPayload.user,
        badge: msgPayload.badge || 'VIP',
        message: msgPayload.text,
        color: msgPayload.color || '#E5C158'
      }]).then(() => {}).catch(() => {});
    }
  }

  // Broadcast a live game activity event to all connected devices & tabs
  sendActivityEvent(activityPayload) {
    // A. Local Listeners
    this.notifyActivity(activityPayload);

    // B. Native Web API BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'ACTIVITY_EVENT', payload: activityPayload });
      } catch (e) {}
    }

    // C. LocalStorage Trigger
    try {
      localStorage.setItem('onyis_last_broadcast_activity', JSON.stringify({ ...activityPayload, _ts: Date.now() }));
    } catch (e) {}

    // D. Supabase Realtime Broadcast
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
