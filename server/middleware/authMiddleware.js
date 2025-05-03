const admin = require('firebase-admin'); 

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided or invalid format' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.uid = decoded.uid;
      req.email = decoded.email || "";
      next();
    } catch (err) {
      console.error('Middleware Error verifying token:', err.code, err.message);
      res.status(401).json({ error: 'Invalid or expired token', code: err.code });
    }
  };

module.exports = { verifyFirebaseToken };