// src/services/rms.services.js
const axios = require("axios");
const https = require("https");

const RMS_URL = "https://rms.bncc.ac.th/api/pornchai/api.php";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const BASE_HEADERS = {
  "Accept": "*/*",
  "X-Application-Request": "pornjira",
  "X-Application-Key": "32ec3d9bec382ca253b8230a0d9b33c4",
};

/**
 * เรียก RMS API กลาง
 */
async function rmsRequest(applicationName, parameter) {
  const response = await axios.get(RMS_URL, {
    httpsAgent,
    headers: {
      ...BASE_HEADERS,
      "X-Application-Name": applicationName,
      "X-Application-Parameter": parameter,
    },
    timeout: 30000,
  });
  return response.data;
}

/**
 * Login ผ่าน RMS
 */
async function rmsLogin(username, password) {
  return rmsRequest("check_auth_rms", `${username}----${password}`);
}

/**
 * ดึงรายชื่อนักเรียนทั้งหมดจาก RMS
 * Response: [{ std_code, std_rfid, std_prefix, std_firstname, std_lastname,
 *              std_gender_code, std_gender_name, std_group_code, std_group_name,
 *              std_major, std_minor }]
 */
async function rmsGetAllStudents() {
  return rmsRequest("copy_student_data", "0");
}

/**
 * ดึงรายชื่อครูทั้งหมดจาก RMS
 * Response: [{ thaiid, first_name, last_name, department }]
 */
async function rmsGetAllTeachers() {
  return rmsRequest("copy_teacher_data", "0");
}

module.exports = { rmsLogin, rmsGetAllStudents, rmsGetAllTeachers };