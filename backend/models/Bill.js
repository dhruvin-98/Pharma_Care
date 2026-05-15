const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    // Reference to pharmacist
    pharmacist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Customer information
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    // Array of medicines purchased
    medicines: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Medicine',
          required: true,
        },
        medicineName: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        pricePerPacket: {
          type: Number,
          required: true,
          min: 0.01,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    // Bill totals
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Payment information
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    // For UPI payments, store UPI reference/transaction ID
    transactionId: {
      type: String,
      trim: true,
      default: null,
    },
    // Bill status
    billStatus: {
      type: String,
      enum: ['draft', 'completed', 'cancelled'],
      default: 'draft',
    },
    // Notes/remarks
    notes: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-update timestamp
billSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
