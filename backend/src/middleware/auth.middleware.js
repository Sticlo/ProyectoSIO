const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar token JWT
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado. Token no proporcionado.' 
    });
  }

  try {
    // Intentar verificar JWT primero
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Si falla JWT, intentar decodificar token simple (para desarrollo)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [email, id, role] = decoded.split(':');
      
      if (email && id && role) {
        req.user = { email, id, role };
        next();
      } else {
        return res.status(403).json({ 
          error: 'Token inválido o expirado' 
        });
      }
    } catch (decodeError) {
      return res.status(403).json({ 
        error: 'Token inválido o expirado' 
      });
    }
  }
};

/**
 * Middleware para verificar rol de administrador
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin
};
