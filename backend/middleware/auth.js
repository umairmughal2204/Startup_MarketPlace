const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production';

const normalizeUser = (user) => {
  const data = user.toJSON ? user.toJSON() : user;
  return { ...data, id: data._id?.toString?.() || data.id };
};

const createToken = (user) =>
  jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

const getTokenFromRequest = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
};

const requireAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ message: 'Account is suspended' });
    }

    req.user = user;
    req.auth = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
};

const requireRole = (...roles) => async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  });
};

const requireSelfOrAdmin = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    const targetId = String(req.params.id || req.params.userId || '');
    if (req.user.role !== 'Admin' && String(req.user._id) !== targetId) {
      return res.status(403).json({ message: 'You can only access your own account' });
    }
    next();
  });
};

module.exports = {
  JWT_SECRET,
  createToken,
  normalizeUser,
  requireAuth,
  requireRole,
  requireSelfOrAdmin,
};