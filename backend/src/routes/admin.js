const express = require('express');
const router = express.Router();
const multer = require('multer');

const { verifyToken } = require('../middlewares/auth');
const { requireSuperAdmin } = require('../middlewares/role');
const { createAdmin, getAdmins } = require('../controllers/admin');
const { syncTeachers, syncStudents } = require('../controllers/sync');
const { syncAll } = require('../controllers/sync');
const { importUsers } = require('../controllers/import');

// Multer — memory storage สำหรับ Excel upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel', // .xls
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
        }
    },
});

// Admin management
router.post('/create', verifyToken, requireSuperAdmin, createAdmin);
router.get('/list', verifyToken, requireSuperAdmin, getAdmins);

// RMS Sync (super_admin only)
router.post('/sync-teachers', verifyToken, requireSuperAdmin, syncTeachers);
router.post('/sync-students', verifyToken, requireSuperAdmin, syncStudents);
router.post('/sync-all', verifyToken, requireSuperAdmin, async (req, res) => {
    try {
        const results = await syncAll();
        return res.json({ message: 'Sync all completed', results });
    } catch (error) {
        console.error('SYNC ALL ERROR:', error);
        return res.status(500).json({ message: 'Error syncing all' });
    }
});

// Excel Import (super_admin only)
router.post('/import-users', verifyToken, requireSuperAdmin, upload.single('file'), importUsers);

module.exports = router;