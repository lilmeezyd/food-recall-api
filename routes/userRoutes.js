const express = require("express");
const router = express.Router();
const {
  registerUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
  loginUser,
  getMe,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", loginUser);
router.post("/requestResetPassword", requestPasswordReset)
router.post("/resetPassword", resetPassword)
router.post("/newPassword", protect, changePassword)
router.get("/me", protect, getMe);

module.exports = router;
