const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createSubscription, getSubscriptions, getSubscriptionById,
  updateSubscription, renewSubscription,
} = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Gestion des abonnements
 */

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Créer un abonnement
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [monthly, annual]
 *                 example: monthly
 *               autoRenew:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Abonnement créé
 *       409:
 *         description: Abonnement actif déjà existant
 */
router.post(
  '/',
  authenticate,
  [body('type').isIn(['monthly', 'annual']).withMessage('Type doit être monthly ou annual')],
  validate,
  createSubscription
);

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Liste des abonnements
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, cancelled]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste paginée des abonnements
 */
router.get('/', authenticate, getSubscriptions);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Détails d'un abonnement
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de l'abonnement
 */
router.get('/:id', authenticate, getSubscriptionById);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   put:
 *     summary: Mettre à jour un abonnement (admin)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, expired, cancelled]
 *               autoRenew:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Abonnement mis à jour
 */
router.put('/:id', authenticate, authorize('admin'), updateSubscription);

/**
 * @swagger
 * /api/subscriptions/{id}/renew:
 *   post:
 *     summary: Renouveler un abonnement
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Abonnement renouvelé
 */
router.post('/:id/renew', authenticate, renewSubscription);

module.exports = router;
