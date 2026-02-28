// src/middleware/role.middleware.js

exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};

exports.requireSuperAdmin = (req, res, next) => {
  if (
    req.user.role !== 'admin' ||
    !req.user.is_super_admin
  ) {
    return res.status(403).json({ message: 'Super Admin only' });
  }
  next();
};