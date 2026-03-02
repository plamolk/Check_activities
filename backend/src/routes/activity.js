const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createActivity, getActivities, createActivityDraft, getActivitiesDraft } = require('../controllers/activity');

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

router.post('/add/activity', upload.single('poster'), createActivity);
router.get('/select/activity_draft', getActivities);
router.post('/add/activity_draft', createActivityDraft);
module.exports = router;