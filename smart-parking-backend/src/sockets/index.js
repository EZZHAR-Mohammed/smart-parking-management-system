const setupSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connecté: ${socket.id}`);

    // Client joins a room (e.g. admin dashboard)
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`📡 ${socket.id} a rejoint: ${room}`);
    });

    // Manual spot status update from client
    socket.on('update-spot', (data) => {
      io.emit('spot-updated', data);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client déconnecté: ${socket.id}`);
    });
  });
};

module.exports = setupSockets;
