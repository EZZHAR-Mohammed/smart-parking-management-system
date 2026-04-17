const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Erreur de validation', errors: messages });
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ success: false, message: 'Cette valeur existe déjà.' });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token invalide.' });
  }

  // Default
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} introuvable.` });
};

module.exports = { errorHandler, notFound };
