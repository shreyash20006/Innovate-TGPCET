/**
 * Socket.io event handlers
 * 
 * Events emitted by client → server:
 *   join-room    { roomId, userId, username }
 *   leave-room   { roomId, userId }
 *   play-state   { roomId, isPlaying, currentTime }
 *   seek         { roomId, currentTime }
 *   track-change { roomId, index, track }
 *   queue-update { roomId, queue }
 *   message      { roomId, message }
 *   typing       { roomId, typing }
 *
 * Events emitted by server → client:
 *   partner-online
 *   partner-offline
 *   play-state   { isPlaying, currentTime }
 *   seek         { currentTime }
 *   track-change { track, index }
 *   queue-update { queue }
 *   message      Message
 *   typing       { typing }
 */

/**
 * In-memory room state for fast sync.
 * roomId → { users: Map<socketId, { userId, username }>, playerState }
 */
const rooms = new Map();

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      playerState: { isPlaying: false, currentTime: 0, updatedAt: Date.now() },
      queue: [],
    });
  }
  return rooms.get(roomId);
}

module.exports = function registerSocketHandlers(io, supabase) {
  // Optional: Auth middleware (verify JWT from Supabase)
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data.user) return next(new Error('Invalid token'));
      socket.userId = data.user.id;
      next();
    } catch {
      next(new Error('Auth error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.userId})`);

    // ── Join Room ──────────────────────────────────────────────────────────
    socket.on('join-room', ({ roomId, userId, username }) => {
      socket.join(roomId);
      const room = getRoom(roomId);
      room.users.set(socket.id, { userId, username });

      // Notify partner
      socket.to(roomId).emit('partner-online');

      // Send current player state to new joiner
      const { playerState, queue } = room;
      const elapsed = (Date.now() - playerState.updatedAt) / 1000;
      const syncedTime = playerState.isPlaying
        ? playerState.currentTime + elapsed
        : playerState.currentTime;

      socket.emit('play-state', { isPlaying: playerState.isPlaying, currentTime: syncedTime });
      socket.emit('queue-update', { queue });

      console.log(`👥 ${username} joined room ${roomId} (${room.users.size} users)`);
    });

    // ── Leave Room ────────────────────────────────────────────────────────
    socket.on('leave-room', ({ roomId }) => {
      _leaveRoom(socket, roomId);
    });

    // ── Play / Pause Sync ─────────────────────────────────────────────────
    socket.on('play-state', ({ roomId, isPlaying, currentTime }) => {
      const room = getRoom(roomId);
      room.playerState = { isPlaying, currentTime, updatedAt: Date.now() };
      socket.to(roomId).emit('play-state', { isPlaying, currentTime });
    });

    // ── Seek ──────────────────────────────────────────────────────────────
    socket.on('seek', ({ roomId, currentTime }) => {
      const room = getRoom(roomId);
      room.playerState.currentTime = currentTime;
      room.playerState.updatedAt = Date.now();
      socket.to(roomId).emit('seek', { currentTime });
    });

    // ── Track Change ──────────────────────────────────────────────────────
    socket.on('track-change', ({ roomId, index, track }) => {
      const room = getRoom(roomId);
      room.playerState = { isPlaying: true, currentTime: 0, updatedAt: Date.now() };
      socket.to(roomId).emit('track-change', { index, track });
    });

    // ── Queue Update ──────────────────────────────────────────────────────
    socket.on('queue-update', ({ roomId, queue }) => {
      const room = getRoom(roomId);
      room.queue = queue;
      socket.to(roomId).emit('queue-update', { queue });
    });

    // ── Chat Message ──────────────────────────────────────────────────────
    socket.on('message', ({ roomId, message }) => {
      socket.to(roomId).emit('message', message);
    });

    // ── Typing Indicator ──────────────────────────────────────────────────
    socket.on('typing', ({ roomId, typing }) => {
      socket.to(roomId).emit('typing', { typing });
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      // Leave all rooms this socket was in
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) _leaveRoom(socket, roomId);
      });
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  function _leaveRoom(socket, roomId) {
    socket.leave(roomId);
    const room = rooms.get(roomId);
    if (room) {
      room.users.delete(socket.id);
      socket.to(roomId).emit('partner-offline');
      if (room.users.size === 0) rooms.delete(roomId);
    }
  }
};
