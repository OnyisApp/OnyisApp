import { supabase } from './supabase';

// Quad-Engine Realtime Hub
// Engine 1: Web API BroadcastChannel (same-browser cross-tab, instant)
// Engine 2: LocalStorage storage event (same-browser cross-window, instant)
// Engine 3: Supabase Realtime Broadcast (cross-device, cross-phone, global)
// Engine 4: Supabase DB Polling (mobile 4G/5G fallback, 3s interval, deduped)
class RealtimeHub {
  constructor() {
    this.channel = null;
    this.broadcastChannel = null;
    this.chatListeners = new Set();
    this.activityListeners = new Set();
    this.seenChatIds = new Set();
    this.seenActivityIds = new Set();
    this.lastChatPollTs = Date.now();
    this.lastActivityPollTs = Date.now();
    this.pollInterval = null;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;

    // 1. Web API BroadcastChannel (same origin, instant, cross-tab & cross-window)
    try {
      this.broadcastChannel = new BroadcastChannel('onyis_realtime_hub_v4');
      this.broadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'CHAT_MESSAGE') this._notifyChat(payload);
        else if (type === 'ACTIVITY_EVENT') this._notifyActivity(payload);
      };
    } catch (e) {}

    // 2. Storage event listener (cross-window fallback)
    window.addEventListener('storage', (e) => {
      if (e.key === 'onyis_bc_chat_v4' && e.newValue) {
        try { this._notifyChat(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'onyis_bc_activity_v4' && e.newValue) {
        try { this._notifyActivity(JSON.parse(e.newValue)); } catch (err) {}
      }
    });

    // 3. Supabase Realtime Broadcast + DB Polling (cross-device, cross-phone)
    if (supabase) {
      try {
        this.channel = supabase.channel('room:onyis_global_v4', {
          config: { broadcast: { self: false } }  // self=false: don't echo back to sender
        });

        this.channel.on('broadcast', { event: 'CHAT_MESSAGE' }, ({ payload }) => {
          this._notifyChat(payload);
        });

        this.channel.on('broadcast', { event: 'ACTIVITY_EVENT' }, ({ payload }) => {
          this._notifyActivity(payload);
        });

        this.channel.subscribe();
      } catch (err) {}

      // 4. Mobile/Safari Polling Fallback — DEDUPED by timestamp (only fetches NEW rows)
      this.pollInterval = setInterval(async () => {
        try {
          // Poll new chat messages since last poll
          const chatCutoff = new Date(this.lastChatPollTs - 1000).toISOString();
          const { data: chatData } = await supabase
            .from('global_chat')
            .select('*')
            .gt('created_at', chatCutoff)
            .order('created_at', { ascending: true })
            .limit(10);

          if (chatData && chatData.length > 0) {
            this.lastChatPollTs = Date.now();
            chatData.forEach(m => {
              this._notifyChat({
                id: `db-${m.id}`,
                user: m.username,
                badge: m.badge || 'DEGEN',
                text: m.message,
                time: new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                color: m.color || '#9DA6B4'
              });
            });
          }

          // Poll new activity events since last poll
          const actCutoff = new Date(this.lastActivityPollTs - 1000).toISOString();
          const { data: actData } = await supabase
            .from('live_activity')
            .select('*')
            .gt('created_at', actCutoff)
            .order('created_at', { ascending: true })
            .limit(10);

          if (actData && actData.length > 0) {
            this.lastActivityPollTs = Date.now();
            actData.forEach(a => {
              this._notifyActivity({
                id: `db-act-${a.id}`,
                game: a.game,
                player: a.player,
                bet: a.bet,
                outcome: a.outcome,
                status: a.status,
                multiplier: a.multiplier,
                time: 'Just now'
              });
            });
          }
        } catch (e) {}
      }, 3000);
    }
  }

  onChat(callback) {
    this.chatListeners.add(callback);
    return () => this.chatListeners.delete(callback);
  }

  onActivity(callback) {
    this.activityListeners.add(callback);
    return () => this.activityListeners.delete(callback);
  }

  _notifyChat(payload) {
    if (!payload || !payload.id) return;
    const key = String(payload.id);
    if (this.seenChatIds.has(key)) return;
    this.seenChatIds.add(key);
    // Keep set bounded
    if (this.seenChatIds.size > 500) {
      const first = this.seenChatIds.values().next().value;
      this.seenChatIds.delete(first);
    }
    this.chatListeners.forEach(cb => { try { cb(payload); } catch (e) {} });
  }

  _notifyActivity(payload) {
    if (!payload || !payload.id) return;
    const key = String(payload.id);
    if (this.seenActivityIds.has(key)) return;
    this.seenActivityIds.add(key);
    if (this.seenActivityIds.size > 500) {
      const first = this.seenActivityIds.values().next().value;
      this.seenActivityIds.delete(first);
    }
    this.activityListeners.forEach(cb => { try { cb(payload); } catch (e) {} });
  }

  sendChatMessage(msgPayload) {
    // Mark as seen immediately (self-send dedup)
    if (msgPayload.id) this.seenChatIds.add(String(msgPayload.id));

    // Notify local listeners
    this.chatListeners.forEach(cb => { try { cb(msgPayload); } catch (e) {} });

    // BroadcastChannel (same-browser cross-tab)
    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage({ type: 'CHAT_MESSAGE', payload: msgPayload }); } catch (e) {}
    }

    // LocalStorage trigger (cross-window)
    try {
      localStorage.setItem('onyis_bc_chat_v4', JSON.stringify({ ...msgPayload, _ts: Date.now() }));
    } catch (e) {}

    // Supabase Realtime Broadcast (cross-device, cross-phone, global)
    if (this.channel) {
      try {
        this.channel.send({ type: 'broadcast', event: 'CHAT_MESSAGE', payload: msgPayload });
      } catch (e) {}
    }

    // Supabase DB persist (message history)
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
    // Mark as seen immediately
    if (activityPayload.id) this.seenActivityIds.add(String(activityPayload.id));

    // Notify local listeners
    this.activityListeners.forEach(cb => { try { cb(activityPayload); } catch (e) {} });

    // BroadcastChannel
    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage({ type: 'ACTIVITY_EVENT', payload: activityPayload }); } catch (e) {}
    }

    // LocalStorage trigger
    try {
      localStorage.setItem('onyis_bc_activity_v4', JSON.stringify({ ...activityPayload, _ts: Date.now() }));
    } catch (e) {}

    // Supabase Realtime Broadcast (cross-device global)
    if (this.channel) {
      try {
        this.channel.send({ type: 'broadcast', event: 'ACTIVITY_EVENT', payload: activityPayload });
      } catch (e) {}
    }

    // Supabase DB persist (activity history for polling fallback)
    if (supabase) {
      supabase.from('live_activity').insert([{
        game: activityPayload.game,
        player: activityPayload.player,
        bet: activityPayload.bet,
        outcome: activityPayload.outcome,
        status: activityPayload.status,
        multiplier: activityPayload.multiplier
      }]).then(() => {}).catch(() => {});
    }
  }

  destroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.broadcastChannel) { try { this.broadcastChannel.close(); } catch (e) {} }
    if (this.channel && supabase) { try { supabase.removeChannel(this.channel); } catch (e) {} }
  }
}

export const realtimeHub = new RealtimeHub();
