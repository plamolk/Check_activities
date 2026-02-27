// src/controllers/auth.controller.js
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const { rmsLogin } = require('../services/rms.services');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1️⃣ เรียก RMS

    const rmsResponse = await rmsLogin(username, password);
    if (!rmsResponse.result || rmsResponse.result.length === 0) {
      return res.status(401).json({ message: 'Login failed' });
    }

    const user = rmsResponse.result[0];

    let user_id;
    let role;
    let prefix;
    let first_name;
    let last_name;
    let department = null;
    let group_code = null;
    let group_name = null;
    let rfid = null;

    // 2️⃣ แยก student / teacher
    if (user.std_code) {
      user_id = user.std_code;
      role = 1;
      prefix = user.std_prefix;
      first_name = user.std_firstname;
      last_name = user.std_lastname;
      department = user.std_major;
      group_code = user.std_group_code;
      group_name = user.std_group_name;
      rfid = user.std_rfid;
    }

    if (user.thaiid) {
      user_id = user.thaiid;
      role = 2;
      prefix = null;
      first_name = user.first_name;
      last_name = user.last_name;
      department = user.department;
    }

    // 3️⃣ Insert หรือ Update
    await db.query(
      `
      INSERT INTO user
      (user_id, role_id, user_prefix, first_name, last_name, user_rfid, user_group_code, user_group_name, user_department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        role_id = VALUES(role),
        user_prefix = VALUES(prefix),
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        user_rfid = VALUES(rfid),
        group_code = VALUES(group_code),
        group_name = VALUES(group_name),
        user_department = VALUES(department)
      `,
      [user_id, role, prefix, first_name, last_name, rfid, group_code, group_name, department]
    );

    // 4️⃣ สร้าง JWT
    const token = jwt.sign(
      { user_id, role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Login success',
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};