// src/controllers/sync.js
const { rmsGetAllStudents, rmsGetAllTeachers } = require('../services/rms.services');
const { upsertTeacher, upsertStudent } = require('../services/user.service');

/**
 * POST /admin/sync-teachers
 * Sync ครูทั้งหมดจาก RMS → database
 * สิทธิ์: super_admin เท่านั้น
 */
exports.syncTeachers = async (req, res) => {
    try {
        const rmsData = await rmsGetAllTeachers();

        if (!rmsData.result || rmsData.result.length === 0) {
            return res.status(404).json({ message: 'No teacher data from RMS' });
        }

        const teachers = rmsData.result;
        let inserted = 0;
        let updated = 0;
        const errors = [];

        for (const teacher of teachers) {
            try {
                // เช็คว่ามีอยู่แล้วหรือไม่
                const db = require('../config/db');
                const [existing] = await db.query(
                    'SELECT user_id FROM user WHERE user_code = ?',
                    [teacher.thaiid]
                );

                await upsertTeacher(teacher);

                if (existing.length === 0) {
                    inserted++;
                } else {
                    updated++;
                }
            } catch (err) {
                errors.push({
                    thaiid: teacher.thaiid,
                    name: `${teacher.first_name} ${teacher.last_name}`,
                    error: err.message
                });
            }
        }

        return res.json({
            message: 'Sync teachers completed',
            total: teachers.length,
            inserted,
            updated,
            errors: errors.length,
            errorDetails: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error('SYNC TEACHERS ERROR:', error);
        return res.status(500).json({ message: 'Error syncing teachers' });
    }
};

/**
 * POST /admin/sync-students
 * Sync นักเรียนทั้งหมดจาก RMS → database
 * สิทธิ์: super_admin เท่านั้น
 */
exports.syncStudents = async (req, res) => {
    try {
        const rmsData = await rmsGetAllStudents();

        if (!rmsData.result || rmsData.result.length === 0) {
            return res.status(404).json({ message: 'No student data from RMS' });
        }

        const students = rmsData.result;
        let inserted = 0;
        let updated = 0;
        const errors = [];

        for (const student of students) {
            try {
                const db = require('../config/db');
                const [existing] = await db.query(
                    'SELECT user_id FROM user WHERE user_code = ?',
                    [student.std_code]
                );

                await upsertStudent(student);

                if (existing.length === 0) {
                    inserted++;
                } else {
                    updated++;
                }
            } catch (err) {
                errors.push({
                    std_code: student.std_code,
                    name: `${student.std_firstname} ${student.std_lastname}`,
                    error: err.message
                });
            }
        }

        return res.json({
            message: 'Sync students completed',
            total: students.length,
            inserted,
            updated,
            errors: errors.length,
            errorDetails: errors.length > 0 ? errors : undefined,
        });

    } catch (error) {
        console.error('SYNC STUDENTS ERROR:', error);
        return res.status(500).json({ message: 'Error syncing students' });
    }
};

/**
 * POST /admin/sync-all
 * Sync ทั้งครูและนักเรียนในครั้งเดียว
 * ใช้โดย cron job และ manual trigger
 */
exports.syncAll = async () => {
    const results = { teachers: null, students: null };

    try {
        // Sync teachers
        const teacherData = await rmsGetAllTeachers();
        if (teacherData.result && teacherData.result.length > 0) {
            let tInserted = 0, tUpdated = 0, tErrors = [];
            const db = require('../config/db');

            for (const teacher of teacherData.result) {
                try {
                    const [existing] = await db.query(
                        'SELECT user_id FROM user WHERE user_code = ?',
                        [teacher.thaiid]
                    );
                    await upsertTeacher(teacher);
                    if (existing.length === 0) tInserted++;
                    else tUpdated++;
                } catch (err) {
                    tErrors.push({ thaiid: teacher.thaiid, error: err.message });
                }
            }
            results.teachers = { total: teacherData.result.length, inserted: tInserted, updated: tUpdated, errors: tErrors.length };
        }

        // Sync students
        const studentData = await rmsGetAllStudents();
        if (studentData.result && studentData.result.length > 0) {
            let sInserted = 0, sUpdated = 0, sErrors = [];
            const db = require('../config/db');

            for (const student of studentData.result) {
                try {
                    const [existing] = await db.query(
                        'SELECT user_id FROM user WHERE user_code = ?',
                        [student.std_code]
                    );
                    await upsertStudent(student);
                    if (existing.length === 0) sInserted++;
                    else sUpdated++;
                } catch (err) {
                    sErrors.push({ std_code: student.std_code, error: err.message });
                }
            }
            results.students = { total: studentData.result.length, inserted: sInserted, updated: sUpdated, errors: sErrors.length };
        }
    } catch (error) {
        console.error('SYNC ALL ERROR:', error);
    }

    return results;
};
