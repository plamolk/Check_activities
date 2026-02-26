// src/controllers/profile.controller.js
function profile(req, res) {
  res.json({
    message: "You are logged in",
    user: req.user
  });
}

module.exports = { profile };