const User = require('./User');
const ParkingSpot = require('./ParkingSpot');
const Reservation = require('./Reservation');
const Subscription = require('./Subscription');
const Payment = require('./Payment');

// User <-> Reservation
User.hasMany(Reservation, { foreignKey: 'userId', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ParkingSpot <-> Reservation
ParkingSpot.hasMany(Reservation, { foreignKey: 'spotId', as: 'reservations' });
Reservation.belongsTo(ParkingSpot, { foreignKey: 'spotId', as: 'spot' });

// User <-> Subscription
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Payment
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Reservation <-> Payment
Reservation.hasOne(Payment, { foreignKey: 'reservationId', as: 'payment' });
Payment.belongsTo(Reservation, { foreignKey: 'reservationId', as: 'reservation' });

// Subscription <-> Payment
Subscription.hasMany(Payment, { foreignKey: 'subscriptionId', as: 'payments' });
Payment.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

module.exports = { User, ParkingSpot, Reservation, Subscription, Payment };
