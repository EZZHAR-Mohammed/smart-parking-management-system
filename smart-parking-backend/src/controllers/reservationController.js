const { Reservation, ParkingSpot, User } = require('../models');

// POST /api/reservations
const createReservation = async (req, res) => {
  try {
    const { spotId, startTime, endTime, vehiclePlate, notes } = req.body;
    const userId = req.user.id;

    // Check spot exists and is free
    const spot = await ParkingSpot.findByPk(spotId);
    if (!spot) return res.status(404).json({ success: false, message: 'Place introuvable.' });
    if (spot.status !== 'free') {
      return res.status(400).json({ success: false, message: `Place ${spot.number} n'est pas disponible (${spot.status}).` });
    }

    // Check no overlapping reservation
    const { Op } = require('sequelize');
    const overlap = await Reservation.findOne({
      where: {
        spotId,
        status: 'active',
        [Op.or]: [
          { startTime: { [Op.between]: [startTime, endTime || new Date()] } },
          { endTime: { [Op.between]: [startTime, endTime || new Date()] } },
        ],
      },
    });
    if (overlap) return res.status(409).json({ success: false, message: 'Créneau déjà réservé.' });

    // Calculate amount
    let totalAmount = null;
    if (endTime) {
      const hours = (new Date(endTime) - new Date(startTime)) / 3600000;
      totalAmount = (hours * spot.pricePerHour).toFixed(2);
    }

    const reservation = await Reservation.create({
      userId, spotId, startTime, endTime, vehiclePlate, notes, totalAmount,
    });

    // Update spot status
    await spot.update({ status: 'reserved' });

    // Emit real-time
    if (req.io) {
      req.io.emit('reservation-created', { reservation, spot });
      req.io.emit('spot-updated', { ...spot.toJSON(), status: 'reserved' });
    }

    const full = await Reservation.findByPk(reservation.id, {
      include: [
        { model: ParkingSpot, as: 'spot' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
    });

    res.status(201).json({ success: true, message: 'Réservation créée.', data: { reservation: full } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reservations
const getReservations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    // Non-admin users only see their own
    if (req.user.role !== 'admin') where.userId = req.user.id;
    else if (userId) where.userId = userId;

    if (status) where.status = status;

    const { count, rows } = await Reservation.findAndCountAll({
      where,
      include: [
        { model: ParkingSpot, as: 'spot' },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: { reservations: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reservations/:id
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, {
      include: [{ model: ParkingSpot, as: 'spot' }, { model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    if (!reservation) return res.status(404).json({ success: false, message: 'Réservation introuvable.' });

    if (req.user.role !== 'admin' && reservation.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }

    res.json({ success: true, data: { reservation } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/reservations/:id/end — libérer une place
const endReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, { include: [{ model: ParkingSpot, as: 'spot' }] });
    if (!reservation) return res.status(404).json({ success: false, message: 'Réservation introuvable.' });
    if (reservation.status !== 'active') return res.status(400).json({ success: false, message: 'Réservation déjà terminée.' });

    const endTime = new Date();
    const hours = (endTime - reservation.startTime) / 3600000;
    const totalAmount = (hours * reservation.spot.pricePerHour).toFixed(2);

    await reservation.update({ endTime, status: 'completed', totalAmount });
    await reservation.spot.update({ status: 'free' });

    if (req.io) {
      req.io.emit('spot-updated', { ...reservation.spot.toJSON(), status: 'free' });
      req.io.emit('spot-available', { spotId: reservation.spotId });
    }

    res.json({ success: true, message: 'Réservation terminée.', data: { reservation, totalAmount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/reservations/:id — annuler
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByPk(req.params.id, { include: [{ model: ParkingSpot, as: 'spot' }] });
    if (!reservation) return res.status(404).json({ success: false, message: 'Réservation introuvable.' });

    if (req.user.role !== 'admin' && reservation.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }

    await reservation.update({ status: 'cancelled' });
    await reservation.spot.update({ status: 'free' });

    if (req.io) req.io.emit('spot-updated', { ...reservation.spot.toJSON(), status: 'free' });

    res.json({ success: true, message: 'Réservation annulée.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReservation, getReservations, getReservationById, endReservation, cancelReservation };
