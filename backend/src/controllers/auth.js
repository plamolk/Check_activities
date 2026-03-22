const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { rmsLogin } = require('../services/rms.services');
const { splitPrefix } = require('../utils/prefix');
const { upsertUser } = require('../services/user.service');

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

    // ===========================
    // 🆕 Auto-Fetch Group (เฉพาะนักเรียนที่ยังไม่มีกลุ่ม)
    // ===========================
    let fetchedGroupCode = null;
    let fetchedGroupName = null;

    if (role_id === 1) {
      const [existing] = await db.query(
        'SELECT user_group_code FROM user WHERE user_code = ?',
        [rmsUser.username]
      );

      // ถ้านักเรียนคนนี้ยังไม่เคยถูกบันทึกกลุ่ม
      if (existing.length === 0 || !existing[0].user_group_code) {
        const { rmsGetAllStudents } = require('../services/rms.services');
        try {
          const stdData = await rmsGetAllStudents();
          if (stdData && stdData.result) {
            const studentMatch = stdData.result.find(s => String(s.std_code) === String(rmsUser.username));
            if (studentMatch) {
              fetchedGroupCode = studentMatch.std_group_code || null;
              fetchedGroupName = studentMatch.std_group_name || null;
            }
          }
        } catch (err) {
          console.error("Auto-fetch student group failed:", err.message);
        }
      }
    }

    // ===========================
    // 4️⃣ แยก prefix + upsertUser
    // ===========================
    const nameData = splitPrefix(rmsUser.first_name);

    const user_id = await upsertUser({
      user_code: rmsUser.username,
      role_id,
      user_prefix: nameData.prefix,
      first_name: nameData.first_name,
      last_name: rmsUser.last_name,
      department_name: rmsUser.department || null,
      user_group_code: fetchedGroupCode,
      user_group_name: fetchedGroupName,
    });

    // ===========================
    // 5️⃣ JWT
    // ===========================
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