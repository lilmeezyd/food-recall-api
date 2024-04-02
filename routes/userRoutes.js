const express = require("express");
const router = express.Router();
const {
  registerUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
  loginUser,
  getMe,
  changeNotifications,
  updateDetails
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", loginUser);
router.post("/requestResetPassword", requestPasswordReset)
router.post("/resetPassword", resetPassword)
router.put("/newPassword", protect, changePassword)
router.put('/notifications', protect, changeNotifications)
router.put('/updateDetails', protect, updateDetails)
router.get("/me", protect, getMe);

module.exports = router;
