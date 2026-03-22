// src/routes/attendance.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/role');
const {
    checkAttendance,
    checkAttendanceBulk,
    getAttendanceByActivity,
    updateAttendance,
} = require('../controllers/attendance');

// เช็คชื่อ (teacher/admin)
router.post('/check', verifyToken, requireAdmin, checkAttendance);

// เช็คชื่อหลายคน (teacher/admin)
router.post('/check-bulk', verifyToken, requireAdmin, checkAttendanceBulk);

// ดูรายชื่อเช็คชื่อของ activity (teacher/admin)
router.get('/activity/:activity_id', verifyToken, getAttendanceByActivity);

// แก้ไขสถานะ (teacher/admin)
router.put('/:attendance_id', verifyToken, requireAdmin, updateAttendance);

module.exports = router;
