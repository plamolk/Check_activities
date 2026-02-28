// src/middleware/role.middleware.js

exports.requireAdmin = (req, res, next) => {
  if (req.user.role_id !== 3) {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};

exports.requireSuperAdmin = (req, res, next) => {
  if (
    req.user.role_id !== 3 ||
    !req.user.admin_super
  ) {
    return res.status(403).json({ message: 'Super Admin only' });
  }
  next();
};