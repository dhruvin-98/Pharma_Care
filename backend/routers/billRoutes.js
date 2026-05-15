// backend/routers/billRoutes.js

const express = require('express');
const router = express.Router();
const {
  createBill,
  processBillPayment,
  getBills,
  getBillById,
  cancelBill,
  getBillStats,
} = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

// Base route: /api/bills

// Bill creation and listing
router.route('/')
  .get(protect, getBills)        // GET all bills for pharmacist
  .post(protect, createBill);    // POST to create a new bill

// Bill payment processing
router.post('/:billId/pay', protect, processBillPayment);

// Get bill by ID
router.get('/:billId', protect, getBillById);

// Cancel bill
router.put('/:billId/cancel', protect, cancelBill);

// Get bill statistics
router.get('/stats/summary', protect, getBillStats);

module.exports = router;
