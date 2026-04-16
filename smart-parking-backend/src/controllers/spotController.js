const { ParkingSpot, Reservation } = require('../models');

// GET /api/spots
const getAllSpots = async (req, res) => {
  try {
    const { status, type, floor } = req.query;
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (floor) where.floor = floor;

    const spots = await ParkingSpot.findAll({ where, order: [['number', 'ASC']] });

    const stats = {
      total: spots.length,
      free: spots.filter((s) => s.status === 'free').length,
      occupied: spots.filter((s) => s.status === 'occupied').length,
      reserved: spots.filter((s) => s.status === 'reserved').length,
    };

    res.json({ success: true, data: { spots, stats } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/spots/:id
const getSpotById = async (req, res) => {
  try {
    const spot = await ParkingSpot.findByPk(req.params.id, {
      include: [{ model: Reservation, as: 'reservations', where: { status: 'active' }, required: false }],
    });

    if (!spot) return res.status(404).json({ success: false, message: 'Place introuvable.' });

    res.json({ success: true, data: { spot } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/spots (admin)
const createSpot = async (req, res) => {
  try {
    const { number, type, floor, section, pricePerHour } = req.body;

    const existing = await ParkingSpot.findOne({ where: { number } });
    if (existing) return res.status(409).json({ success: false, message: 'Numéro de place déjà existant.' });

    const spot = await ParkingSpot.create({ number, type, floor, section, pricePerHour });

    // Emit socket event
    if (req.io) req.io.emit('spot-created', spot);

    res.status(201).json({ success: true, message: 'Place créée.', data: { spot } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/spots/:id (admin)
const updateSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findByPk(req.params.id);
    if (!spot) return res.status(404).json({ success: false, message: 'Place introuvable.' });

    const { status, type, floor, section, pricePerHour } = req.body;
    await spot.update({ status, type, floor, section, pricePerHour });

    // Emit real-time event
    if (req.io) req.io.emit('spot-updated', spot);

    res.json({ success: true, message: 'Place mise à jour.', data: { spot } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/spots/:id (admin)
const deleteSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findByPk(req.params.id);
    if (!spot) return res.status(404).json({ success: false, message: 'Place introuvable.' });

    // Check no active reservation
    const active = await Reservation.findOne({ where: { spotId: spot.id, status: 'active' } });
    if (active) return res.status(400).json({ success: false, message: 'Place avec réservation active.' });

    await spot.destroy();
    if (req.io) req.io.emit('spot-deleted', { id: req.params.id });

    res.json({ success: true, message: 'Place supprimée.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllSpots, getSpotById, createSpot, updateSpot, deleteSpot };
