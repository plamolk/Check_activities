const db = require('../config/db');
exports.createActivity = async (req, res) => {
    try {
        const { activity_name, activity_detail, start_time, end_time, created_by } = req.body;

        const activity_image = req.file ? req.file.filename : null;

        const [result] = await db.query(
            `
            INSERT INTO activity
            (activity_name, activity_detail, start_time, end_time, created_by, activity_image)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [activity_name, activity_detail, start_time, end_time, created_by, activity_image]
        );

        res.json({ message: 'Activity created successfully', activity_id: result.insertId });

    } catch (error) {
        console.error('ACTIVITY ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getActivities = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM activity WHERE activity_status = "draft"');
        res.json(rows);
    } catch (error) {
        console.error('ACTIVITY ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createActivityDraft = async (req, res) => {
    try {
        const { activity_id, teacher_id } = req.body;

        const [result] = await db.query(
            `
            INSERT INTO activity_responsible
            (activity_id, teacher_id)
            VALUES (?, ?)
            `,
            [activity_id, teacher_id]
        );

        res.json({ message: 'Activity created successfully' });

    } catch (error) {
        console.error('ACTIVITY ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};