
const jwt = require("jsonwebtoken");
const { rmsLogin } = require("../services/rms.services");

async function login(req, res) {
  // 1) รับข้อมูลจากคนที่พยายาม login
  const { username, password } = req.body;

  // กันกรณีไม่ส่งข้อมูลมา
  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  }

  try {
    // 2) เอาข้อมูลไปถาม RMS
    const rmsResponse = await rmsLogin(username, password);

    // 3) เช็คว่า RMS อนุญาตไหม
    console.log("RMS RESPONSE:", rmsResponse);
    if (!rmsResponse.result || rmsResponse.result.length === 0) {
      return res.status(401).json({ message: "Login failed" });
    }

    // 4) ดึงข้อมูล user คนแรก
    const user = rmsResponse.result[0];

    // 5) สร้างบัตรผ่าน (JWT)
    const token = jwt.sign(
      {
        user_id: user.user_id || user.id,
        role: user.role || "student"
      },
      process.env.JWT_SECRET || "dev_secret",
      { expiresIn: "1d" }
    );

    // 6) ส่ง token กลับไป
    res.json({
      message: "Login success",
      token
    });

  } catch (err) {
    res.status(500).json({ message: "RMS error" });
  }
}

module.exports = { login };