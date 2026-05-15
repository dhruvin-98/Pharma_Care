const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp, loginUser, getUserProfile, updateUserProfile } =
  require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);

router.get("/me", protect, getUserProfile);

router.put('/update-profile', protect, updateUserProfile);

module.exports = router;
