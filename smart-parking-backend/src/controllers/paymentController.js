const { Payment, User, Reservation, Subscription } = require('../models');

// POST /api/payments
const createPayment = async (req, res) => {
  try {
    const { reservationId, subscriptionId, amount, method, transactionRef } = req.body;
    const userId = req.user.id;

    const payment = await Payment.create({
      userId, reservationId, subscriptionId, amount, method,
      status: 'completed', transactionRef, date: new Date(),
    });

    res.status(201).json({ success: true, message: 'Paiement enregistré.', data: { payment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments
const getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, method } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (req.user.role !== 'admin') where.userId = req.user.id;
    if (status) where.status = status;
    if (method) where.method = method;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']],
    });

    res.json({
      success: true,
      data: { payments: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/payments/:id
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Paiement introuvable.' });
    if (req.user.role !== 'admin' && payment.userId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Accès refusé.' });

    res.json({ success: true, data: { payment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/payments/:id/refund (admin)
const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Paiement introuvable.' });
    if (payment.status !== 'completed')
      return res.status(400).json({ success: false, message: 'Seuls les paiements complétés peuvent être remboursés.' });

    await payment.update({ status: 'refunded' });
    res.json({ success: true, message: 'Remboursement effectué.', data: { payment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createPayment, getPayments, getPaymentById, refundPayment };
