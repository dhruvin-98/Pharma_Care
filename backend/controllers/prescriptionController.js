const Prescription = require("../models/Prescription");
const Medicine = require("../models/Medicine");
const Bill = require("../models/Bill");
const asyncHandler = require("express-async-handler");

/* -------------------------- UPLOAD PRESCRIPTION --------------------------- */
exports.uploadPrescription = asyncHandler(async (req, res) => {
  const { patientName, phone, address } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  const prescription = await Prescription.create({
    userId: req.user._id,
    imageUrl: `/uploads/${req.file.filename}`,
    patientName,
    phone,
    address,
    isDirectOrder: false
  });

  res.status(201).json({
    message: "Prescription uploaded successfully",
    prescription,
  });
});

/* -------------------------- CREATE DIRECT ORDER --------------------------- */
exports.createDirectOrder = asyncHandler(async (req, res) => {
  const { patientName, phone, address, medicines, pharmacistId } = req.body;

  if (!patientName || !phone || !address || !medicines || medicines.length === 0 || !pharmacistId) {
    res.status(400);
    throw new Error("Please fill all required fields: patientName, phone, address, medicines, pharmacistId");
  }

  // Calculate order totals
  let total = 0;
  const orderMedicines = [];

  for (const item of medicines) {
    const subtotal = item.pricePerPacket * item.quantity;
    total += subtotal;
    orderMedicines.push({
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      quantity: parseInt(item.quantity),
      pricePerPacket: parseFloat(item.pricePerPacket),
      subtotal: subtotal
    });
  }

  // Create direct order using the Prescription schema
  const directOrder = await Prescription.create({
    userId: req.user._id,
    pharmacistId,
    imageUrl: "direct-order", // Direct order indicator
    patientName,
    phone,
    address,
    status: "pending",
    isDirectOrder: true,
    medicines: orderMedicines,
    totalAmount: total
  });

  res.status(201).json({
    message: "Direct order placed successfully",
    prescription: directOrder
  });
});

/* --------------------------- GET ALL (PHARMACIST) -------------------------- */
exports.getAllPrescriptions = asyncHandler(async (req, res) => {
  // Pharmacists see:
  // 1. Scanned prescriptions (isDirectOrder: false)
  // 2. Direct orders addressed specifically to them (isDirectOrder: true, pharmacistId: req.user._id)
  const query = {
    $or: [
      { isDirectOrder: false },
      { isDirectOrder: true, pharmacistId: req.user._id }
    ]
  };
  const prescriptions = await Prescription.find(query).sort({ createdAt: -1 });

  res.json({ prescriptions });
});

/* ------------------------------ APPROVE RX -------------------------------- */
exports.approvePrescription = asyncHandler(async (req, res) => {
  const rx = await Prescription.findById(req.params.id);

  if (!rx) return res.status(404).json({ message: "Prescription not found" });

  // Direct Order Stock Deduction and Billing
  if (rx.isDirectOrder) {
    // 1. Check stock and reduce inventory
    for (const item of rx.medicines) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        res.status(404);
        throw new Error(`Medicine "${item.medicineName}" not found in inventory.`);
      }

      if (medicine.quantity < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient quantity for "${item.medicineName}". Available: ${medicine.quantity}`);
      }

      // Deduct stock
      medicine.quantity -= item.quantity;
      if (medicine.quantity <= 0) {
        medicine.status = 'out_of_stock';
        medicine.quantity = 0;
      } else {
        medicine.status = 'instock';
      }
      await medicine.save();
    }

    // 2. Create auto-billing receipt for pharmacist records
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
    const sequence = Math.floor(Math.random() * 9000) + 1000;
    const billNumber = `BILL-${dateStr}-${sequence}`;

    const billMedicines = rx.medicines.map(m => ({
      medicineId: m.medicineId,
      medicineName: m.medicineName,
      category: "Direct Order",
      quantity: m.quantity,
      pricePerPacket: m.pricePerPacket,
      subtotal: m.subtotal
    }));

    await Bill.create({
      billNumber,
      pharmacist: rx.pharmacistId,
      customerName: rx.patientName,
      customerPhone: rx.phone,
      medicines: billMedicines,
      totalAmount: rx.totalAmount,
      tax: 0,
      finalAmount: rx.totalAmount,
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      billStatus: 'completed',
      notes: 'Auto-generated from Approved Direct Order'
    });
  }

  rx.status = "approved";
  await rx.save();

  res.json({ message: "Prescription/Order approved successfully", prescription: rx });
});

/* ------------------------------ REJECT RX -------------------------------- */
exports.rejectPrescription = asyncHandler(async (req, res) => {
  const { pharmacistNote } = req.body;
  const rx = await Prescription.findById(req.params.id);

  if (!rx) return res.status(404).json({ message: "Prescription not found" });

  rx.status = "rejected";
  rx.pharmacistNote = pharmacistNote || "Rejected by pharmacist";
  await rx.save();

  res.json({ message: "Prescription/Order rejected", prescription: rx });
});

/* --------------------- GET SINGLE USER PRESCRIPTIONS ---------------------- */
exports.getUserPrescriptions = asyncHandler(async (req, res) => {
  const prescriptions = await Prescription.find({ userId: req.params.userId })
    .sort({ createdAt: -1 });

  res.json({ prescriptions });
});
