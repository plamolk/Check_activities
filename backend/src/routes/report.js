// src/routes/report.js
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
    getActivityReport,
    getStudentReport,
    getSummaryReport,
} = require('../controllers/report');

// สรุป attendance ของ activity
router.get('/activity/:activity_id', verifyToken, getActivityReport);

// สรุป attendance ของนักเรียน
router.get('/student/:user_id', verifyToken, getStudentReport);

// ภาพรวมทั้งระบบ
router.get('/summary', verifyToken, getSummaryReport);

module.exports = router;
