const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { rmsLogin } = require('../services/rms.services');
const { splitPrefix } = require('../utils/prefix');
const { findOrCreateDepartment } = require('../services/department');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ===========================
    // 1️⃣ เช็ค Admin ก่อน
    // ===========================
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

    // ===========================
    // 2️⃣ RMS Login
    // ===========================
    const rmsResponse = await rmsLogin(username, password);

    if (!rmsResponse.result || rmsResponse.result.length === 0) {
      return res.status(401).json({ message: 'Login failed' });
    }

    const rmsUser = rmsResponse.result[0];

    // ===========================
    // 3️⃣ Map role
    // ===========================
    let role_id;
    if (rmsUser.types === 'S') role_id = 1;
    else if (rmsUser.types === 'T') role_id = 2;
    else return res.status(400).json({ message: 'Unknown user type' });

    const user_code = rmsUser.username;

    // ===========================
    // 4️⃣ แยก prefix
    // ===========================
    const nameData = splitPrefix(rmsUser.first_name);
    const prefix = nameData.prefix;
    const first_name = nameData.first_name;
    const last_name = rmsUser.last_name;

    // ===========================
    // 5️⃣ Department
    // ===========================
    const department_id = await findOrCreateDepartment(rmsUser.department);

    // ===========================
    // 6️⃣ หา user จาก user_code ก่อน
    // ===========================
    const [existingUser] = await db.query(
      'SELECT user_id FROM user WHERE user_code = ?',
      [user_code]
    );

    let user_id;

    if (existingUser.length === 0) {
      // insert ใหม่
      const [result] = await db.query(
        `
        INSERT INTO user
        (user_code, role_id, user_prefix, first_name, last_name, department_id)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [user_code, role_id, prefix, first_name, last_name, department_id]
      );

      user_id = result.insertId;
    } else {
      user_id = existingUser[0].user_id;

      // update ข้อมูล
      await db.query(
        `
        UPDATE user
        SET role_id = ?,
            user_prefix = ?,
            first_name = ?,
            last_name = ?,
            department_id = ?
        WHERE user_id = ?
        `,
        [role_id, prefix, first_name, last_name, department_id, user_id]
      );
    }

    // ===========================
    // 7️⃣ JWT
    // ===========================
    const token = jwt.sign(
      {
        user_id,     // internal id
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