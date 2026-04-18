const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createReservation, getReservations, getReservationById,
  endReservation, cancelReservation,
} = require('../controllers/reservationController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: Gestion des réservations de places
 */

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Créer une réservation
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [spotId, startTime]
 *             properties:
 *               spotId:
 *                 type: integer
 *                 example: 1
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-14T09:00:00Z"
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-14T11:00:00Z"
 *               vehiclePlate:
 *                 type: string
 *                 example: "12345-A-6"
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Réservation créée
 *       400:
 *         description: Place non disponible
 *       409:
 *         description: Créneau déjà réservé
 */
router.post(
  '/',
  authenticate,
  [
    body('spotId').isInt({ min: 1 }).withMessage('spotId requis'),
    body('startTime').isISO8601().withMessage('startTime invalide (ISO 8601)'),
    body('endTime').optional().isISO8601().withMessage('endTime invalide'),
  ],
  validate,
  createReservation
);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Liste des réservations
 *     tags: [Reservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled]
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filtrer par utilisateur (admin seulement)
 *     responses:
 *       200:
 *         description: Liste paginée des réservations
 */
router.get('/', authenticate, getReservations);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Détails d'une réservation
 *     tags: [Reservations]
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
 *         description: Détails de la réservation
 */
router.get('/:id', authenticate, getReservationById);

/**
 * @swagger
 * /api/reservations/{id}/end:
 *   put:
 *     summary: Terminer une réservation (libérer la place)
 *     tags: [Reservations]
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
 *         description: Réservation terminée, place libérée
 */
router.put('/:id/end', authenticate, endReservation);

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     summary: Annuler une réservation
 *     tags: [Reservations]
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
 *         description: Réservation annulée
 */
router.delete('/:id', authenticate, cancelReservation);

module.exports = router;
