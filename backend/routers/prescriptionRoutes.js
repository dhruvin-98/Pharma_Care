const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  uploadPrescription,
  getAllPrescriptions,
  approvePrescription,
  rejectPrescription,
  getUserPrescriptions,
} = require("../controllers/prescriptionController");

const { protect } = require("../middleware/authMiddleware");
const { onlyPharmacist } = require("../middleware/roleMiddleware");

/* ---------- MULTER STORAGE ---------- */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/* --------------------- ROUTES --------------------------- */

// USER: Upload Prescription
router.post(
  "/upload",
  protect,
  upload.single("prescriptionImage"),
  uploadPrescription
);

// PHARMACIST: Get all prescriptions
router.get("/all", protect, onlyPharmacist, getAllPrescriptions);

// PHARMACIST: Approve prescription
router.put("/approve/:id", protect, onlyPharmacist, approvePrescription);

// PHARMACIST: Reject prescription
router.put("/reject/:id", protect, onlyPharmacist, rejectPrescription);

// USER: Get their own prescriptions
router.get("/user/:userId", protect, getUserPrescriptions);

module.exports = router;
