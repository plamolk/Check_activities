const db = require('../config/db');

exports.findOrCreateDepartment = async (departmentName) => {
  if (!departmentName) return null;

  const trimmed = departmentName.trim();

  const [rows] = await db.query(
    'SELECT department_id FROM department WHERE department_name = ?',
    [trimmed]
  );

  if (rows.length > 0) {
    return rows[0].department_id;
  }

  const [result] = await db.query(
    'INSERT INTO department (department_name) VALUES (?)',
    [trimmed]
  );

  return result.insertId;
};