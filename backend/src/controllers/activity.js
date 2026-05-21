const db = require('../config/db');
const fs = require('fs');
const path = require('path');

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

exports.getAllActivities = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM activity ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('GET ALL ACTIVITIES ERROR:', error);
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
exports.getTeachers = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT user_id, user_code, user_prefix, first_name, last_name
             FROM user
             WHERE role_id = 2
             ORDER BY first_name, last_name`
        );
        res.json(rows);
    } catch (error) {
        console.error('GET TEACHERS ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getActivityTeachers = async (req, res) => {
    try {
        const activity_id = req.params.id;
        const [rows] = await db.query(
            `SELECT u.user_id as teacher_id, u.user_code, u.user_prefix, u.first_name, u.last_name 
             FROM activity_responsible ar 
             JOIN user u ON ar.teacher_id = u.user_id 
             WHERE ar.activity_id = ?`, [activity_id]
        );
        res.json(rows);
    } catch (error) {
        console.error('GET ACT TEACHERS ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.confirmActivityTeachers = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const activity_id = req.params.id;
        const { teacher_ids } = req.body;
        
        // Delete existing teachers for this activity
        await connection.query('DELETE FROM activity_responsible WHERE activity_id = ?', [activity_id]);
        
        // Insert new teachers
        if (teacher_ids && Array.isArray(teacher_ids) && teacher_ids.length > 0) {
            const values = teacher_ids.map(t_id => [activity_id, t_id]);
            await connection.query('INSERT INTO activity_responsible (activity_id, teacher_id) VALUES ?', [values]);
        }
        
        await connection.commit();
        res.json({ message: 'บันทึกรายชื่อผู้รับผิดชอบสำเร็จ', status: 'draft' });
    } catch (error) {
        await connection.rollback();
        console.error('CONFIRM TEACHERS ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

exports.updateActivity = async (req, res) => {
    try {
        const activity_id = req.params.id;
        const { activity_name, activity_detail, start_time, end_time, remove_image } = req.body;
        
        const [rows] = await db.query('SELECT activity_image FROM activity WHERE activity_id = ?', [activity_id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Activity not found' });
        
        const currentImage = rows[0].activity_image;
        let newImage = currentImage; // fallback
        let deleteOldImage = false;
        
        if (req.file) { // new file uploaded
            newImage = req.file.filename;
            deleteOldImage = true;
        } else if (remove_image === 'true') { // user clicked "remove image" explicitly
            newImage = null;
            deleteOldImage = true;
        }
        
        await db.query(
            'UPDATE activity SET activity_name = ?, activity_detail = ?, start_time = ?, end_time = ?, activity_image = ? WHERE activity_id = ?',
            [activity_name, activity_detail, start_time, end_time, newImage, activity_id]
        );
        
        // Delete old image physically
        if (deleteOldImage && currentImage) {
            const oldImagePath = path.join(__dirname, '../uploads/activity', currentImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        
        res.json({ message: 'อัปเดตข้อมูลกิจกรรมสำเร็จ', new_image: newImage });
    } catch (error) {
        console.error('UPDATE ACTIVITY ERROR:', error);
        res.status(500).json({ message: 'Server error' });
    }
};