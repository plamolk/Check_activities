// src/services/user.service.js
const db = require('../config/db');
const { findOrCreateDepartment } = require('./department');

/**
 * Upsert user — INSERT ถ้าไม่มี, UPDATE ถ้ามีแล้ว
 * ใช้ user_code เป็น key สำหรับ student, user_thaiid เป็น key สำหรับ teacher
 *
 * @param {Object} data
 * @param {string} data.user_code       - รหัสนักเรียน (student) หรือ thaiid (teacher)
 * @param {number} data.role_id         - 1=student, 2=teacher
 * @param {string} [data.user_prefix]   - คำนำหน้า
 * @param {string} data.first_name
 * @param {string} data.last_name
 * @param {string} [data.department_name] - ชื่อแผนก (จะ auto findOrCreate)
 * @param {string} [data.user_group_code]
 * @param {string} [data.user_group_name]
 * @param {string} [data.user_thaiid]   - เลขบัตรประชาชน
 * @param {string} [data.user_rfid]     - RFID card
 * @returns {Promise<number>} user_id
 */
async function upsertUser(data) {
    const {
        user_code,
        role_id,
        user_prefix = null,
        first_name,
        last_name,
        department_name = null,
        user_group_code = null,
        user_group_name = null,
        user_thaiid = null,
        user_rfid = null,
    } = data;

    // หา department_id
    const department_id = department_name
        ? await findOrCreateDepartment(department_name)
        : null;

    // หา user จาก user_code
    const [existingUser] = await db.query(
        'SELECT user_id FROM user WHERE user_code = ?',
        [user_code]
    );

    if (existingUser.length === 0) {
        // INSERT ใหม่
        const [result] = await db.query(
            `INSERT INTO user
       (user_code, role_id, user_prefix, first_name, last_name,
        department_id, user_group_code, user_group_name, user_thaiid, user_rfid)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_code, role_id, user_prefix, first_name, last_name,
                department_id, user_group_code, user_group_name, user_thaiid, user_rfid]
        );
        return result.insertId;
    } else {
        // UPDATE ข้อมูล
        const user_id = existingUser[0].user_id;
        await db.query(  
            `UPDATE user  
       SET role_id = ?,  
           user_prefix = ?,  
           first_name = ?,  
           last_name = ?,  
           department_id = ?,  
           user_group_code = ?,  
           user_group_name = ?,  
           user_thaiid = COALESCE(?, user_thaiid),
           user_rfid = COALESCE(?, user_rfid)
       WHERE user_id = ?`,
            [role_id, user_prefix, first_name, last_name,
                department_id, user_group_code, user_group_name,
                user_thaiid, user_rfid, user_id]
        );
        return user_id;
    }
}

/**
 * Upsert teacher — ใช้ thaiid เป็น key (ครูไม่มี user_code แบบนักเรียน)
 * จะใช้ thaiid เป็น user_code ด้วยเพื่อให้ระบบทำงานเป็นเอกภาพ
 */
async function upsertTeacher(data) {
    const { thaiid, first_name, last_name, department_name } = data;

    // ใช้ splitPrefix กับ first_name ที่มาจาก RMS (มี prefix ติดมา)
    const { splitPrefix } = require('../utils/prefix');
    const nameData = splitPrefix(first_name);

    return upsertUser({
        user_code: thaiid,
        role_id: 2,
        user_prefix: nameData.prefix,
        first_name: nameData.first_name,
        last_name,
        department_name,
        user_thaiid: thaiid,
    });
}

/**
 * Upsert student — ใช้ std_code เป็น key
 */
async function upsertStudent(data) {
    return upsertUser({
        user_code: data.std_code,
        role_id: 1,
        user_prefix: data.std_prefix || null,
        first_name: data.std_firstname,
        last_name: data.std_lastname,
        department_name: data.std_major || null,
        user_group_code: data.std_group_code || null,
        user_group_name: data.std_group_name || null,
        user_rfid: data.std_rfid || null,
    });
}

module.exports = { upsertUser, upsertTeacher, upsertStudent };
