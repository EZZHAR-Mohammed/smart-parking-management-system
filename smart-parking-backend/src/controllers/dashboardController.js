const { User, ParkingSpot, Reservation, Subscription, Payment } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalSpots, activeReservations, activeSubscriptions] = await Promise.all([
      User.count({ where: { isActive: true } }),
      ParkingSpot.count(),
      Reservation.count({ where: { status: 'active' } }),
      Subscription.count({ where: { status: 'active' } }),
    ]);

    const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } });

    const spotStats = await ParkingSpot.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      group: ['status'],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSpots,
        activeReservations,
        activeSubscriptions,
        totalRevenue: totalRevenue || 0,
        spotStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/occupancy
const getOccupancy = async (req, res) => {
  try {
    const total = await ParkingSpot.count();
    const occupied = await ParkingSpot.count({ where: { status: { [Op.in]: ['occupied', 'reserved'] } } });
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;

    // Occupancy by type
    const byType = await ParkingSpot.findAll({
      attributes: ['type', 'status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['type', 'status'],
      raw: true,
    });

    // Last 7 days reservations
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyReservations = await Reservation.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true,
    });

    res.json({
      success: true,
      data: { total, occupied, free: total - occupied, occupancyRate: parseFloat(occupancyRate), byType, dailyReservations },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/revenue
const getRevenue = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let groupBy, dateFormat;
    if (period === 'daily') {
      groupBy = sequelize.fn('DATE', sequelize.col('date'));
      dateFormat = 'DATE';
    } else if (period === 'weekly') {
      groupBy = sequelize.fn('DATE_TRUNC', 'week', sequelize.col('date'));
      dateFormat = 'week';
    } else {
      groupBy = sequelize.fn('DATE_TRUNC', 'month', sequelize.col('date'));
      dateFormat = 'month';
    }

    const revenue = await Payment.findAll({
      attributes: [
        [groupBy, 'period'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'transactions'],
      ],
      where: { status: 'completed' },
      group: [groupBy],
      order: [[groupBy, 'ASC']],
      raw: true,
    });

    res.json({ success: true, data: { revenue, period } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getOccupancy, getRevenue };
