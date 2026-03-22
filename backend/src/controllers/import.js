// src/controllers/import.js
const XLSX = require('xlsx');
const { upsertUser } = require('../services/user.service');

/**
 * POST /admin/import-users
 * Import ข้อมูล user จาก Excel
 * สิทธิ์: super_admin เท่านั้น
 *
 * Excel columns ที่รองรับ:
 *   user_code (จำเป็น), role (student/teacher, จำเป็น),
 *   prefix, first_name (จำเป็น), last_name (จำเป็น),
 *   department, group_code, group_name, thaiid, rfid
 */
exports.importUsers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // อ่าน Excel จาก buffer
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        let inserted = 0;
        let updated = 0;
        const errors = [];
        const db = require('../config/db');

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2; // Excel row (1-indexed + header)

            try {
                // Validate required fields
                if (!row.user_code) {
                    errors.push({ row: rowNum, error: 'user_code is required' });
                    continue;
                }
                if (!row.first_name) {
                    errors.push({ row: rowNum, error: 'first_name is required' });
                    continue;
                }
                if (!row.last_name) {
                    errors.push({ row: rowNum, error: 'last_name is required' });
                    continue;
                }
                if (!row.role) {
                    errors.push({ row: rowNum, error: 'role is required (student/teacher)' });
                    continue;
                }

                // Map role
                const roleLower = String(row.role).toLowerCase().trim();
                let role_id;
                if (roleLower === 'student' || roleLower === '1') role_id = 1;
                else if (roleLower === 'teacher' || roleLower === '2') role_id = 2;
                else {
                    errors.push({ row: rowNum, error: `Invalid role: ${row.role}. Must be student or teacher` });
                    continue;
                }

                // เช็คว่ามีอยู่แล้วหรือไม่
                const [existing] = await db.query(
                    'SELECT user_id FROM user WHERE user_code = ?',
                    [String(row.user_code)]
                );

                await upsertUser({
                    user_code: String(row.user_code),
                    role_id,
                    user_prefix: row.prefix || null,
                    first_name: String(row.first_name),
                    last_name: String(row.last_name),
                    department_name: row.department || null,
                    user_group_code: row.group_code ? String(row.group_code) : null,
                    user_group_name: row.group_name || null,
                    user_thaiid: row.thaiid ? String(row.thaiid) : null,
                    user_rfid: row.rfid ? String(row.rfid) : null,
                });

                if (existing.length === 0) {
                    inserted++;
                } else {
                    updated++;
                }
            } catch (err) {
                errors.push({ row: rowNum, user_code: row.user_code, error: err.message });
            }
        }

        return res.json({
            message: 'Import completed',
            total: rows.length,
            inserted,
            updated,
            errors: errors.length,
            errorDetails: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error('IMPORT USERS ERROR:', error);
        return res.status(500).json({ message: 'Error importing users' });
    }
};
