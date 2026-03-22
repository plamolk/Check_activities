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
      (role_id, admin_user, admin_password, first_name, last_name, admin_super, user_thaiid)
      VALUES (3, ?, ?, ?, ?, 0, 0)
      `,
      [
        username,
        hashedPassword,
        first_name,
        last_name
      ]
    );

    return res.json({ message: 'Admin created successfully' });

  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);
    return res.status(500).json({ message: 'Error creating admin' });
  }
};
exports.getAdmins = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, admin_user, first_name, last_name, admin_super FROM user WHERE role_id = 3'
    );

    res.json(rows);
  } catch (error) {
    console.error('GET ADMINS ERROR:', error);
    return res.status(500).json({ message: 'Error fetching admins' });
  }
};