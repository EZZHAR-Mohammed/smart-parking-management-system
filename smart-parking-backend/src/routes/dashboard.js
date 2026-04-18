const express = require('express');
const router = express.Router();
const { getStats, getOccupancy, getRevenue } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Statistiques et analytics (admin)
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Statistiques générales du parking
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats globales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     totalSpots:
 *                       type: integer
 *                     activeReservations:
 *                       type: integer
 *                     activeSubscriptions:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 */
router.get('/stats', authenticate, authorize('admin'), getStats);

/**
 * @swagger
 * /api/dashboard/occupancy:
 *   get:
 *     summary: Taux d'occupation du parking
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données d'occupation
 */
router.get('/occupancy', authenticate, authorize('admin'), getOccupancy);

/**
 * @swagger
 * /api/dashboard/revenue:
 *   get:
 *     summary: Revenus par période
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: Données de revenus
 */
router.get('/revenue', authenticate, authorize('admin'), getRevenue);

module.exports = router;
