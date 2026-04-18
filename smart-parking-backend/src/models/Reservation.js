const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reservation = sequelize.define('Reservation', {
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
  spotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'parking_spots', key: 'id' },
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'cancelled'),
    defaultValue: 'active',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  vehiclePlate: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'reservations',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['spotId'] },
    { fields: ['status'] },
    { fields: ['startTime'] },
  ],
});

module.exports = Reservation;
