const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAllSpots, getSpotById, createSpot, updateSpot, deleteSpot } = require('../controllers/spotController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Parking Spots
 *   description: Gestion des places de parking
 */

/**
 * @swagger
 * /api/spots:
 *   get:
 *     summary: Liste toutes les places
 *     tags: [Parking Spots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [free, occupied, reserved, maintenance]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [normal, vip, handicap, electric]
 *       - in: query
 *         name: floor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des places avec statistiques
 */
router.get('/', authenticate, getAllSpots);

/**
 * @swagger
 * /api/spots/{id}:
 *   get:
 *     summary: Détails d'une place
 *     tags: [Parking Spots]
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
 *         description: Détails de la place
 *       404:
 *         description: Place introuvable
 */
router.get('/:id', authenticate, getSpotById);

/**
 * @swagger
 * /api/spots:
 *   post:
 *     summary: Créer une nouvelle place (admin)
 *     tags: [Parking Spots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [number]
 *             properties:
 *               number:
 *                 type: string
 *                 example: A-01
 *               type:
 *                 type: string
 *                 enum: [normal, vip, handicap, electric]
 *                 example: normal
 *               floor:
 *                 type: string
 *                 example: RDC
 *               section:
 *                 type: string
 *                 example: A
 *               pricePerHour:
 *                 type: number
 *                 example: 5.00
 *     responses:
 *       201:
 *         description: Place créée
 *       409:
 *         description: Numéro déjà existant
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  [body('number').notEmpty().withMessage('Numéro requis')],
  validate,
  createSpot
);

/**
 * @swagger
 * /api/spots/{id}:
 *   put:
 *     summary: Mettre à jour une place (admin)
 *     tags: [Parking Spots]
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
 *                 enum: [free, occupied, reserved, maintenance]
 *               type:
 *                 type: string
 *               pricePerHour:
 *                 type: number
 *     responses:
 *       200:
 *         description: Place mise à jour
 */
router.put('/:id', authenticate, authorize('admin'), updateSpot);

/**
 * @swagger
 * /api/spots/{id}:
 *   delete:
 *     summary: Supprimer une place (admin)
 *     tags: [Parking Spots]
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
 *         description: Place supprimée
 *       400:
 *         description: Place avec réservation active
 */
router.delete('/:id', authenticate, authorize('admin'), deleteSpot);

module.exports = router;
