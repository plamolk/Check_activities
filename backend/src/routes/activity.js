const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/role');
const { createActivity, getActivities, createActivityDraft } = require('../controllers/activity');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads/person');
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
router.post('/add/activity_draft', verifyToken, requireAdmin, createActivityDraft);
module.exports = router;