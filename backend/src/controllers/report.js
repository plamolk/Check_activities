// src/controllers/report.js
const db = require('../config/db');

/**
 * GET /report/activity/:activity_id
 * สรุป attendance ของ activity
 */
exports.getActivityReport = async (req, res) => {
    try {
        const { activity_id } = req.params;

        // ข้อมูล activity
        const [activityRows] = await db.query(
            'SELECT * FROM activity WHERE activity_id = ?',
            [activity_id]
        );

        if (activityRows.length === 0) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // สรุปจำนวน
        const [summary] = await db.query(
            `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN check_status = 'present' THEN 1 ELSE 0 END) AS present_count,
         SUM(CASE WHEN check_status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
         SUM(CASE WHEN check_status = 'late' THEN 1 ELSE 0 END) AS late_count
       FROM attendance
       WHERE activity_id = ?`,
            [activity_id]
        );

        // รายชื่อทั้งหมด
        const [attendees] = await db.query(
            `SELECT
         a.attendance_id,
         u.user_id,
         u.user_code,
         u.user_prefix,
         u.first_name,
         u.last_name,
         u.user_group_name,
         a.check_time,
         a.check_status
       FROM attendance a
       JOIN user u ON a.user_id = u.user_id
       WHERE a.activity_id = ?
       ORDER BY a.check_status, u.user_group_name, u.first_name`,
            [activity_id]
        );

        return res.json({
            activity: activityRows[0],
            summary: summary[0],
            attendees,
        });

    } catch (error) {
        console.error('ACTIVITY REPORT ERROR:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /report/student/:user_id
 * สรุป attendance ของนักเรียนคนหนึ่ง
 */
exports.getStudentReport = async (req, res) => {
    try {
        const { user_id } = req.params;

        // ข้อมูลนักเรียน
        const [userRows] = await db.query(
            `SELECT user_id, user_code, user_prefix, first_name, last_name,
              user_group_name, role_id
       FROM user WHERE user_id = ?`,
            [user_id]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // สรุปจำนวน
        const [summary] = await db.query(
            `SELECT
         COUNT(*) AS total_activities,
         SUM(CASE WHEN check_status = 'present' THEN 1 ELSE 0 END) AS present_count,
         SUM(CASE WHEN check_status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
         SUM(CASE WHEN check_status = 'late' THEN 1 ELSE 0 END) AS late_count
       FROM attendance
       WHERE user_id = ?`,
            [user_id]
        );

        // รายการ activity ทั้งหมด
        const [activities] = await db.query(
            `SELECT
         a.attendance_id,
         act.activity_id,
         act.activity_name,
         act.start_time,
         act.end_time,
         a.check_time,
         a.check_status
       FROM attendance a
       JOIN activity act ON a.activity_id = act.activity_id
       WHERE a.user_id = ?
       ORDER BY act.start_time DESC`,
            [user_id]
        );

        return res.json({
            user: userRows[0],
            summary: summary[0],
            activities,
        });

    } catch (error) {
        console.error('STUDENT REPORT ERROR:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /report/summary
 * ภาพรวมทั้งระบบ
 */
exports.getSummaryReport = async (req, res) => {
    try {
        // จำนวน user แยกตาม role
        const [userCounts] = await db.query(
            `SELECT
         role_id,
         r.role_name,
         COUNT(*) AS count
       FROM user u
       JOIN role r ON u.role_id = r.role_id
       GROUP BY u.role_id, r.role_name`
        );

        // จำนวน activity แยกตาม status
        const [activityCounts] = await db.query(
            `SELECT
         activity_status,
         COUNT(*) AS count
       FROM activity
       GROUP BY activity_status`
        );

        // สรุป attendance ทั้งหมด
        const [attendanceSummary] = await db.query(
            `SELECT
         COUNT(*) AS total_records,
         SUM(CASE WHEN check_status = 'present' THEN 1 ELSE 0 END) AS present_count,
         SUM(CASE WHEN check_status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
         SUM(CASE WHEN check_status = 'late' THEN 1 ELSE 0 END) AS late_count
       FROM attendance`
        );

        return res.json({
            users: userCounts,
            activities: activityCounts,
            attendance: attendanceSummary[0],
        });

    } catch (error) {
        console.error('SUMMARY REPORT ERROR:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
