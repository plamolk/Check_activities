// src/controllers/admin.controller.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.createAdmin = async (req, res) => {
  try {
    const { username, password, first_name, last_name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `
      INSERT INTO user
      (user_id, role_id, admin_user, admin_password, first_name, last_name, admin_super)
      VALUES (?, '3', ?, ?, ?, ?, '0')
      `,
      [
        `admin_${Date.now()}`,
        username,
        hashedPassword,
        first_name,
        last_name
      ]
    );

    return res.json({ message: 'Admin created successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating admin' });
  }
};

exports.getAdmins = async (req, res) => {
  const [rows] = await db.query(
    'SELECT user_id, admin_user, first_name, last_name, admin_super FROM user WHERE role_id = 3'
  );

  res.json(rows);
};