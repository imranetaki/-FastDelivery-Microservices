const jwt = require('jsonwebtoken');


module.exports = function isAuthenticated(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }
  
  jwt.verify(token, "secret", (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalide.' });
    }
    console.log("Token décodé :", user);
    req.user = user;
    next();
  });
};
