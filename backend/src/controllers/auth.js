const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { rmsLogin } = require('../services/rms.services');
const { splitPrefix } = require('../utils/prefix');
const { findOrCreateDepartment } = require('../services/department');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ====================================================
    // 1️⃣ เช็ค Admin ก่อน (ไม่ผ่าน RMS)
    // ====================================================
    const [adminRows] = await db.query(
      'SELECT * FROM user WHERE admin_user = ? AND role_id = 3',
      [username]
    );

    if (adminRows.length > 0) {
      const admin = adminRows[0];

      const isMatch = await bcrypt.compare(password, admin.admin_password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid admin password' });
      }

      const token = jwt.sign(
        {
          user_id: admin.user_id,
          role_id: admin.role_id,
          admin_super: admin.admin_super
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        message: 'Admin login success',
        token
      });
    }

    // ====================================================
    // 2️⃣ ถ้าไม่ใช่ admin → เรียก RMS
    // ====================================================
    const rmsResponse = await rmsLogin(username, password);

    if (!rmsResponse.result || rmsResponse.result.length === 0) {
      return res.status(401).json({ message: 'Login failed' });
    }

    const user = rmsResponse.result[0];

    // ====================================================
    // 3️⃣ Map role จาก types
    // ====================================================
    let role_id;

    if (user.types === 'S') role_id = 1;      // student
    else if (user.types === 'T') role_id = 2; // teacher
    else return res.status(400).json({ message: 'Unknown user type' });

    const user_id = user.username;

    // ====================================================
    // 4️⃣ แยก prefix
    // ====================================================
    const nameData = splitPrefix(user.first_name);

    const prefix = nameData.prefix;
    const first_name = nameData.first_name;
    const last_name = user.last_name;

    // ====================================================
    // 5️⃣ Normalize Department
    // ====================================================
    const department_id = await findOrCreateDepartment(user.department);

    // ====================================================
    // 6️⃣ Insert / Update User
    // ====================================================
    await db.query(
      `
      INSERT INTO user
      (user_id, role_id, user_prefix, first_name, last_name, department_id)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        role_id = VALUES(role_id),
        user_prefix = VALUES(user_prefix),
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        department_id = VALUES(department_id)
      `,
      [user_id, role_id, prefix, first_name, last_name, department_id]
    );

    // ====================================================
    // 7️⃣ สร้าง JWT
    // ====================================================
    const token = jwt.sign(
      {
        user_id,
        role_id,
        admin_super: 0
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      message: 'Login success',
      token
    });

  } catch (error) {
    console.error('AUTH ERROR:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};