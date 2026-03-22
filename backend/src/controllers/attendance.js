// src/controllers/attendance.js
const db = require('../config/db');

/**
 * POST /attendance/check
 * เช็คชื่อนักเรียนในกิจกรรม
 * Body: { activity_id, user_id, check_status }
 * สิทธิ์: teacher / admin
 */
exports.checkAttendance = async (req, res) => {
    try {
        const { activity_id, user_id, check_status } = req.body;
        const checked_by = req.user.user_id;

        if (!activity_id || !user_id) {
            return res.status(400).json({ message: 'activity_id and user_id are required' });
        }

        const validStatus = ['present', 'absent', 'late'];
        const status = validStatus.includes(check_status) ? check_status : 'present';

        // ตรวจสอบว่า activity มีอยู่จริงและเปิดอยู่
        const [activity] = await db.query(
            'SELECT activity_id, activity_status FROM activity WHERE activity_id = ?',
            [activity_id]
        );

        if (activity.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity[0].activity_status !== 'open') {
            return res.status(400).json({ message: 'Activity is not open for attendance' });
        }

        // INSERT or UPDATE attendance (UNIQUE key: activity_id + user_id)
        await db.query(
            `INSERT INTO attendance (activity_id, user_id, check_time, check_status, checked_by)
       VALUES (?, ?, NOW(), ?, ?)
       ON DUPLICATE KEY UPDATE
         check_time = NOW(),
         check_status = VALUES(check_status),
         checked_by = VALUES(checked_by)`,
            [activity_id, user_id, status, checked_by]
        );

        return res.json({ message: 'Attendance checked successfully' });

    } catch (error) {
        console.error('CHECK ATTENDANCE ERROR:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /attendance/check-bulk
 * เช็คชื่อหลายคนในครั้งเดียว
 * Body: { activity_id, attendees: [{ user_id, check_status }] }
 */
exports.checkAttendanceBulk = async (req, res) => {
    try {
        const { activity_id, attendees } = req.body;
        const checked_by = req.user.user_id;

        if (!activity_id || !attendees || !Array.isArray(attendees)) {
            return res.status(400).json({ message: 'activity_id and attendees array are required' });
        }

        // ตรวจสอบ activity
        const [activity] = await db.query(
            'SELECT activity_id, activity_status FROM activity WHERE activity_id = ?',
            [activity_id]
        );

        if (activity.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity[0].activity_status !== 'open') {
            return res.status(400).json({ message: 'Activity is not open for attendance' });
        }

        let success = 0;
        const errors = [];

        for (const attendee of attendees) {
            try {
                const status = ['present', 'absent', 'late'].includes(attendee.check_status)
                    ? attendee.check_status
                    : 'present';

                await db.query(
                    `INSERT INTO attendance (activity_id, user_id, check_time, check_status, checked_by)
           VALUES (?, ?, NOW(), ?, ?)
           ON DUPLICATE KEY UPDATE
             check_time = NOW(),
             check_status = VALUES(check_status),
             checked_by = VALUES(checked_by)`,
                    [activity_id, attendee.user_id, status, checked_by]
                );
                success++;
            } catch (err) {
                errors.push({ user_id: attendee.user_id, error: err.message });
            }
        }

        return res.json({
            message: 'Bulk attendance checked',
            total: attendees.length,
            success,
            errors: errors.length,
            errorDetails: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error('BULK ATTENDANCE ERROR:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /attendance/activity/:activity_id
 * ดูรายชื่อเช็คชื่อทั้งหมดของ activity
 */
exports.getAttendanceByActivity = async (req, res) => {
    try {
        const { activity_id } = req.params;

        const [rows] = await db.query(
            `SELECT
         a.attendance_id,
         a.user_id,
         u.user_code,
         u.user_prefix,
         u.first_name,
         u.last_name,
         u.user_group_name,
         a.check_time,
         a.check_status,
         a.checked_by,
         cb.first_name AS checked_by_name
       FROM attendance a
       JOIN user u ON a.user_id = u.user_id
       LEFT JOIN user cb ON a.checked_by = cb.user_id
       WHERE a.activity_id = ?
       ORDER BY u.user_group_name, u.first_name`,
            [activity_id]
        );

        return res.json(rows);

    } catch (error) {
        console.error('GET ATTENDANCE ERROR:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * PUT /attendance/:attendance_id
 * แก้ไขสถานะเช็คชื่อ
 */
exports.updateAttendance = async (req, res) => {
    try {
        const { attendance_id } = req.params;
        const { check_status } = req.body;

        const validStatus = ['present', 'absent', 'late'];
        if (!validStatus.includes(check_status)) {
            return res.status(400).json({ message: 'Invalid check_status. Must be: present, absent, or late' });
        }

        const [result] = await db.query(
            `UPDATE attendance
       SET check_status = ?,
           checked_by = ?,
           check_time = NOW()
       WHERE attendance_id = ?`,
            [check_status, req.user.user_id, attendance_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        return res.json({ message: 'Attendance updated successfully' });

    } catch (error) {
        console.error('UPDATE ATTENDANCE ERROR:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
