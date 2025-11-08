

const jwt = require('jsonwebtoken'); // Pour la gestion des tokens JWT
require('dotenv').config();  // Pour charger les variables d'environnement depuis le fichier .env

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Récupération du token depuis l'en-tête Authorization
  if (!authHeader) return res.status(401).json({ message: 'Aucun token fourni' });

  const token = authHeader.split(' ')[1] ; // Extraction du token (format "Bearer <token>")
  jwt.verify(token,process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token invalide ou expiré' });
    req.user = decoded; // { id, username, role, squad, iat, exp }
    next();
  });
};



// middleware pour vérifier rôle
const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Non authentifié' }); // Vérifie que l'utilisateur est authentifié
  if (req.user.role !== role) return res.status(403).json({ message: 'Accès refusé' });
  next();
};