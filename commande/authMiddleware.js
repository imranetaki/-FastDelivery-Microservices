const jwt = require('jsonwebtoken');

module.exports = function isAuthenticated(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  }

  jwt.verify(token, "secret", (err, user) => { // Remplace "secret" par ta vraie clé secrète
    if (err) {
      return res.status(403).json({ message: 'Token invalide ou expiré.' });
    }
    
    console.log("Token décodé :", user);
    req.user = user; // Ajoute l'utilisateur extrait du token à req
    next();
  });
};
