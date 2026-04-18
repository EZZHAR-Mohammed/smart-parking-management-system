const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  reservationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'reservations', key: 'id' },
  },
  subscriptionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'subscriptions', key: 'id' },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  method: {
    type: DataTypes.ENUM('card', 'cash', 'transfer', 'online'),
    defaultValue: 'card',
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  transactionRef: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'payments',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['status'] },
    { fields: ['date'] },
  ],
});

module.exports = Payment;
