// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // 1) ดึง token จาก header
  const authHeader = req.headers.authorization;

  // ถ้าไม่มี token
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // รูปแบบ: Bearer <token>
  const token = authHeader.split(" ")[1];

  try {
    // 2) ตรวจ token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret"
    );

    // 3) เก็บข้อมูล user ไว้ใน req
    req.user = decoded;

    // 4) ผ่าน → ไปต่อ
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = authMiddleware;3