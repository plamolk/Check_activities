const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/role');
const { createActivity, getActivities, createActivityDraft, getTeachers, confirmActivityTeachers, getActivityTeachers, updateActivity, getAllActivities } = require('../controllers/activity');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/activity');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/add/activity', verifyToken, requireAdmin, upload.single('poster'), createActivity);
router.get('/select/activity_draft', verifyToken, getActivities);
router.get('/select/activity_all', verifyToken, requireAdmin, getAllActivities);
router.post('/add/activity_draft', verifyToken, requireAdmin, createActivityDraft);
router.post('/edit/activity/:id', verifyToken, requireAdmin, upload.single('poster'), updateActivity);
router.post('/confirm/activity_draft/:id', verifyToken, requireAdmin, confirmActivityTeachers);
router.get('/select/teachers', verifyToken, requireAdmin, getTeachers);
router.get('/select/activity/:id/teachers', verifyToken, requireAdmin, getActivityTeachers);
module.exports = router;