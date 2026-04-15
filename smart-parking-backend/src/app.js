const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const spotRoutes = require('./routes/spots');
const reservationRoutes = require('./routes/reservations');
const subscriptionRoutes = require('./routes/subscriptions');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Trop de requêtes, réessayez plus tard.' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Trop de tentatives de connexion.' },
});

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Socket.io injection middleware ──────────────────────────
app.use((req, res, next) => {
  req.io = app.get('io');
  next();
});

// ─── Swagger UI ──────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customSiteTitle: '🅿️ Smart Parking API',
  customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
  },
}));

// ─── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ success: true, message: '🅿️ Smart Parking API is running', timestamp: new Date() });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/spots', spotRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Error handling ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
