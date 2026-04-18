const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParkingSpot = sequelize.define('ParkingSpot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  number: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('free', 'occupied', 'reserved', 'maintenance'),
    defaultValue: 'free',
  },
  type: {
    type: DataTypes.ENUM('normal', 'vip', 'handicap', 'electric'),
    defaultValue: 'normal',
  },
  floor: {
    type: DataTypes.STRING(10),
    defaultValue: 'RDC',
  },
  section: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  pricePerHour: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 5.00,
  },
}, {
  tableName: 'parking_spots',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['type'] },
  ],
});

module.exports = ParkingSpot;
