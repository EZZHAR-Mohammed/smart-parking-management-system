const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { connectDB } = require('./src/config/database');
const setupSockets = require('./src/sockets');
require('./src/models/index'); // load associations
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);
setupSockets(io);

// ─── Start ───────────────────────────────────────────────────
const start = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log('\n🚀 ========================================');
    console.log(`🅿️  Smart Parking API démarré`);
    console.log(`📡 Serveur    : http://localhost:${PORT}`);
    console.log(`📚 Swagger UI : http://localhost:${PORT}/api-docs`);
    console.log(`❤️  Health     : http://localhost:${PORT}/health`);
    console.log('==========================================\n');
  });
};

start().catch((err) => {
  console.error('❌ Erreur démarrage:', err);
  process.exit(1);
});
