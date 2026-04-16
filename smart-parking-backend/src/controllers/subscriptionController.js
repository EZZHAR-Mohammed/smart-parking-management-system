const { Subscription, User } = require('../models');

const PRICES = { monthly: 150.00, annual: 1500.00 };

// POST /api/subscriptions
const createSubscription = async (req, res) => {
  try {
    const { type, autoRenew } = req.body;
    const userId = req.user.id;

    // Check no active subscription
    const existing = await Subscription.findOne({ where: { userId, status: 'active' } });
    if (existing) return res.status(409).json({ success: false, message: 'Abonnement actif déjà existant.' });

    const startDate = new Date();
    const endDate = new Date(startDate);
    if (type === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
    else endDate.setFullYear(endDate.getFullYear() + 1);

    const subscription = await Subscription.create({
      userId, type, startDate, endDate, price: PRICES[type], autoRenew: autoRenew || false,
    });

    res.status(201).json({ success: true, message: 'Abonnement créé.', data: { subscription } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (req.user.role !== 'admin') where.userId = req.user.id;
    if (status) where.status = status;

    const { count, rows } = await Subscription.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: { subscriptions: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/subscriptions/:id
const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    if (!subscription) return res.status(404).json({ success: false, message: 'Abonnement introuvable.' });
    if (req.user.role !== 'admin' && subscription.userId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Accès refusé.' });

    res.json({ success: true, data: { subscription } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/subscriptions/:id
const updateSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) return res.status(404).json({ success: false, message: 'Abonnement introuvable.' });

    const { status, autoRenew } = req.body;
    await subscription.update({ status, autoRenew });

    res.json({ success: true, message: 'Abonnement mis à jour.', data: { subscription } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/subscriptions/:id/renew
const renewSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByPk(req.params.id);
    if (!subscription) return res.status(404).json({ success: false, message: 'Abonnement introuvable.' });
    if (req.user.role !== 'admin' && subscription.userId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Accès refusé.' });

    const startDate = new Date(subscription.endDate);
    const endDate = new Date(startDate);
    if (subscription.type === 'monthly') endDate.setMonth(endDate.getMonth() + 1);
    else endDate.setFullYear(endDate.getFullYear() + 1);

    await subscription.update({ startDate, endDate, status: 'active' });

    res.json({ success: true, message: 'Abonnement renouvelé.', data: { subscription } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSubscription, getSubscriptions, getSubscriptionById, updateSubscription, renewSubscription };
