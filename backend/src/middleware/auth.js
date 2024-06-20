const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Token aus dem Header holen
  const token = req.header('x-auth-token');
  
  // Token überprüfen
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Token verifizieren
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
