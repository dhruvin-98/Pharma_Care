// backend/controllers/inventoryController.js

const asyncHandler = require("express-async-handler");
const Medicine = require("../models/Medicine");


/* ---------------------------------------------------------
   @desc    Get Low Stock & Expiry Alerts
   @route   GET /api/inventory/alerts
   @access  Private (Pharmacist only)
--------------------------------------------------------- */

const getAlerts = asyncHandler(async (req, res) => {
    const medicines = await Medicine.find({ user: req.user._id });

    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    const alerts = {
        lowStock: [],
        expiringSoon: [],
        expired: []
    };

    medicines.forEach(m => {
        // Low stock condition
        if (m.quantity <= m.reorderLevel) {
            alerts.lowStock.push({
                name: m.name,
                quantity: m.quantity,
                reorderLevel: m.reorderLevel,
                batchNumber: m.batchNumber
            });
        }

        // Expiry logic
        const expiryDate = new Date(m.expiryDate);

        if (expiryDate < today) {
            alerts.expired.push({
                name: m.name,
                expiryDate: m.expiryDate,
                batchNumber: m.batchNumber
            });
        } else if (expiryDate <= next30Days) {
            alerts.expiringSoon.push({
                name: m.name,
                expiryDate: m.expiryDate,
                daysLeft: Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)),
                batchNumber: m.batchNumber
            });
        }
    });

    res.status(200).json(alerts);
});

const getMedicines = asyncHandler(async (req, res) => {
    // Get pagination parameters from query string
    const { page = 1, limit = 10, search, category } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const pageLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const skip = (pageNum - 1) * pageLimit;

    // Build query
    let query = { user: req.user._id };

    // Add search filter
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { batchNumber: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
        ];
    }

    // Add category filter
    if (category && category !== 'all') {
        query.category = category;
    }

    // Get total count for pagination
    const totalCount = await Medicine.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageLimit);

    // Fetch medicines with pagination
    const medicines = await Medicine.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit);

    res.status(200).json({
        success: true,
        data: medicines,
        pagination: {
            total: totalCount,
            count: medicines.length,
            page: pageNum,
            limit: pageLimit,
            pages: totalPages,
        },
    });
});

const addMedicine = asyncHandler(async (req, res) => {
    const { name, category, quantity, pricePerPacket, expiryDate, batchNumber, reorderLevel } = req.body;

    if (!name || !category || quantity === undefined || !pricePerPacket || !expiryDate) {
        res.status(400);
        throw new Error("Please fill all required fields: name, category, quantity, pricePerPacket, expiryDate.");
    }

    // 3. Create the new medicine item
    const medicine = await Medicine.create({
        name,
        category,
        quantity: parseInt(quantity),
        pricePerPacket: parseFloat(pricePerPacket),
        expiryDate: new Date(expiryDate),
        batchNumber: batchNumber || null,
        reorderLevel: reorderLevel || 10,
        status: parseInt(quantity) > 0 ? 'instock' : 'out_of_stock',
        user: req.user._id, // Associate the item with the logged-in user
    });

    res.status(201).json(medicine);
});

/* ---------------------------------------------------------
   @desc    Update an existing medicine item
   @route   PUT /api/inventory/:id
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const updateMedicine = asyncHandler(async (req, res) => {
    const { name, category, quantity, pricePerPacket, expiryDate, batchNumber, reorderLevel } = req.body;
    const medicineId = req.params.id;

    let medicine = await Medicine.findById(medicineId);

    if (!medicine) {
        res.status(404);
        throw new Error("Medicine not found.");
    }

    // 4. Security Check: Ensure the logged-in user owns this medicine item
    if (medicine.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to update this item.");
    }

    // 5. Update fields (using spread operator to handle undefined fields gracefully)
    const updatedMedicine = await Medicine.findByIdAndUpdate(
        medicineId,
        {
            name: name || medicine.name,
            category: category || medicine.category,
            quantity: quantity !== undefined ? parseInt(quantity) : medicine.quantity,
            pricePerPacket: pricePerPacket || medicine.pricePerPacket,
            expiryDate: expiryDate ? new Date(expiryDate) : medicine.expiryDate,
            batchNumber: batchNumber !== undefined ? batchNumber : medicine.batchNumber,
            reorderLevel: reorderLevel !== undefined ? reorderLevel : medicine.reorderLevel,
            status: (quantity !== undefined && parseInt(quantity) > 0) ? 'instock' : (quantity === 0 ? 'out_of_stock' : medicine.status),
        },
        { new: true, runValidators: true }
    );

    res.status(200).json(updatedMedicine);
});

/* ---------------------------------------------------------
   @desc    Delete a medicine item
   @route   DELETE /api/inventory/:id
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const deleteMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
        res.status(404);
        throw new Error("Medicine not found.");
    }

    // 6. Security Check: Ensure the logged-in user owns this medicine item
    if (medicine.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to delete this item.");
    }

    await medicine.deleteOne();

    res.status(200).json({ message: "Medicine removed successfully." });
});

/* ---------------------------------------------------------
   @desc    Search medicines by name or category
   @route   GET /api/inventory/search?searchTerm=name
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const searchMedicines = asyncHandler(async (req, res) => {
    const { searchTerm } = req.query;

    if (!searchTerm) {
        res.status(400);
        throw new Error("Search term is required.");
    }

    const medicines = await Medicine.find({
        user: req.user._id,
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { category: { $regex: searchTerm, $options: 'i' } },
        ],
    }).select('_id name category quantity pricePerPacket status expiryDate');

    res.status(200).json(medicines);
});

/* ---------------------------------------------------------
   @desc    Get low stock medicines
   @route   GET /api/inventory/low-stock
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const getLowStockMedicines = asyncHandler(async (req, res) => {
    const medicines = await Medicine.find({
        user: req.user._id,
        $expr: { $lte: ['$quantity', '$reorderLevel'] },
    }).sort({ quantity: 1 });

    res.status(200).json(medicines);
});

/* ---------------------------------------------------------
   @desc    Get medicines for billing (available in stock)
   @route   GET /api/inventory/for-billing
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const getMedicinesForBilling = asyncHandler(async (req, res) => {
    const medicines = await Medicine.find({
        user: req.user._id,
        status: 'instock',
        quantity: { $gt: 0 }
    }).select('_id name category quantity pricePerPacket status');

    res.status(200).json(medicines);
});

/* ---------------------------------------------------------
   @desc    Reduce medicine quantity (called after bill payment)
   @route   PUT /api/inventory/reduce/:id
   @access  Private (Pharmacist only)
   @body    { quantityToReduce: number }
--------------------------------------------------------- */
const reduceMedicineQuantity = asyncHandler(async (req, res) => {
    const { quantityToReduce } = req.body;
    const medicineId = req.params.id;

    if (!quantityToReduce || quantityToReduce <= 0) {
        res.status(400);
        throw new Error("Valid quantity to reduce is required.");
    }

    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
        res.status(404);
        throw new Error("Medicine not found.");
    }

    if (medicine.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("Not authorized to update this item.");
    }

    if (medicine.quantity < quantityToReduce) {
        res.status(400);
        throw new Error(`Insufficient quantity. Available: ${medicine.quantity}`);
    }

    // Reduce quantity
    medicine.quantity -= parseInt(quantityToReduce);
    
    // Update status based on new quantity
    if (medicine.quantity <= 0) {
        medicine.status = 'out_of_stock';
        medicine.quantity = 0;
    } else {
        medicine.status = 'instock';
    }

    await medicine.save();

    res.status(200).json({
        success: true,
        message: "Medicine quantity reduced successfully.",
        data: medicine
    });
});

module.exports = {
    getMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    getAlerts,
    searchMedicines,
    getLowStockMedicines,
    getMedicinesForBilling,
    reduceMedicineQuantity,
};