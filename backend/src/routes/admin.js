const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middlewares/auth');
const { requireSuperAdmin } = require('../middlewares/role');
const { createAdmin, getAdmins } = require('../controllers/admin');

router.post(
  '/create',
  verifyToken,
  requireSuperAdmin,
  createAdmin
);

router.get(
  '/list',
  verifyToken,
  requireSuperAdmin,
  getAdmins
);

module.exports = router;