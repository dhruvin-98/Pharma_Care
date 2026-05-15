// backend/routes/inventoryRoutes.js

const express = require('express');
const router = express.Router();
const {
    getMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    getAlerts,
    searchMedicines,
    getLowStockMedicines,
    getMedicinesForBilling,
    reduceMedicineQuantity,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware'); // ASSUMED AUTH MIDDLEWARE

// Base route: /api/inventory

router.get('/alerts', protect, getAlerts);
router.get('/search', protect, searchMedicines);
router.get('/low-stock', protect, getLowStockMedicines);
router.get('/for-billing', protect, getMedicinesForBilling);

router.route('/')
    .get(protect, getMedicines)      // GET all inventory items
    .post(protect, addMedicine);     // POST to add a new item

router.route('/:id')
    .put(protect, updateMedicine)    // PUT to update a specific item
    .delete(protect, deleteMedicine); // DELETE a specific item

router.put('/:id/reduce', protect, reduceMedicineQuantity); // Reduce quantity

module.exports = router;