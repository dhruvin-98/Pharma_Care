// backend/models/Medicine.js

const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        pricePerPacket: {
            type: Number,
            required: true,
            min: 0.01,
            description: "Price per packet (10 pills per packet)"
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['instock', 'out_of_stock'],
            default: 'instock',
        },
        batchNumber: {
            type: String,
            trim: true,
            sparse: true,
            index: true,
        },
        reorderLevel: {
            type: Number,
            required: true,
            default: 10,
            min: 0,
        },
        // Reference to the pharmacist/user who owns this inventory (for multi-pharmacy support)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Drop existing unique index if it exists and recreate with sparse option
medicineSchema.index({ batchNumber: 1, user: 1 }, { sparse: true });

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;