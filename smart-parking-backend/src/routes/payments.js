const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createPayment, getPayments, getPaymentById, refundPayment } = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Gestion des paiements
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Enregistrer un paiement
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, method]
 *             properties:
 *               reservationId:
 *                 type: integer
 *               subscriptionId:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 example: 50.00
 *               method:
 *                 type: string
 *                 enum: [card, cash, transfer, online]
 *                 example: card
 *               transactionRef:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paiement enregistré
 */
router.post(
  '/',
  authenticate,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Montant invalide'),
    body('method').isIn(['card', 'cash', 'transfer', 'online']).withMessage('Méthode invalide'),
  ],
  validate,
  createPayment
);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Liste des paiements
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
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
 *         description: Liste paginée des paiements
 */
router.get('/', authenticate, getPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Détails d'un paiement
 *     tags: [Payments]
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
 *         description: Détails du paiement
 */
router.get('/:id', authenticate, getPaymentById);

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   put:
 *     summary: Rembourser un paiement (admin)
 *     tags: [Payments]
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
 *         description: Remboursement effectué
 */
router.put('/:id/refund', authenticate, authorize('admin'), refundPayment);

module.exports = router;
