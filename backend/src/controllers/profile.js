// src/controllers/profile.controller.js
exports.profile = (req, res) => {
  res.json({
    message: "You are logged in",
    user: req.user
  });
}