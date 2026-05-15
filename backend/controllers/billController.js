// backend/controllers/billController.js

const asyncHandler = require('express-async-handler');
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');

// Generate unique bill number
const generateBillNumber = async (pharmacistId) => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  // Find the last bill for today for this pharmacist
  const lastBill = await Bill.findOne({
    pharmacist: pharmacistId,
    createdAt: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    },
  }).sort({ _id: -1 });

  const sequence = (lastBill ? parseInt(lastBill.billNumber.slice(-4)) : 0) + 1;
  return `BILL-${dateStr}-${String(sequence).padStart(4, '0')}`;
};

/* ---------------------------------------------------------
   @desc    Create a new bill
   @route   POST /api/bills/create
   @access  Private (Pharmacist only)
   @body    { customerName, customerPhone, medicines: [{medicineId, quantity}, ...], paymentMethod }
--------------------------------------------------------- */
const createBill = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, medicines, notes } = req.body;

  if (!customerName || !customerPhone || !medicines || medicines.length === 0) {
    res.status(400);
    throw new Error('Customer name, phone, and medicines are required.');
  }

  let total = 0;
  const billMedicines = [];

  // Process each medicine in the bill
  for (const item of medicines) {
    const medicine = await Medicine.findById(item.medicineId);

    if (!medicine) {
      res.status(404);
      throw new Error(`Medicine with ID ${item.medicineId} not found.`);
    }

    if (medicine.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error(`Not authorized to use medicine ${medicine.name}`);
    }

    if (medicine.quantity < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient quantity for ${medicine.name}. Available: ${medicine.quantity}`);
    }

    const subtotal = medicine.pricePerPacket * item.quantity;
    total += subtotal;

    billMedicines.push({
      medicineId: medicine._id,
      medicineName: medicine.name,
      category: medicine.category,
      quantity: item.quantity,
      pricePerPacket: medicine.pricePerPacket,
      subtotal: subtotal,
    });
  }

  // Create bill
  const billNumber = await generateBillNumber(req.user._id);
  
  const bill = await Bill.create({
    billNumber,
    pharmacist: req.user._id,
    customerName,
    customerPhone,
    medicines: billMedicines,
    totalAmount: total,
    tax: 0, // Can be calculated based on pharmacy rules
    finalAmount: total,
    paymentMethod: 'cash', // Default to cash, will be updated during payment
    paymentStatus: 'pending',
    billStatus: 'draft',
    notes: notes || '',
  });

  res.status(201).json({
    success: true,
    message: 'Bill created successfully. Proceed to payment.',
    data: bill,
  });
});

/* ---------------------------------------------------------
   @desc    Process payment and finalize bill
   @route   POST /api/bills/pay/:billId
   @access  Private (Pharmacist only)
   @body    { paymentMethod: 'cash' | 'upi', transactionId (for UPI) }
--------------------------------------------------------- */
const processBillPayment = asyncHandler(async (req, res) => {
  const { paymentMethod, transactionId } = req.body;
  const billId = req.params.billId;

  if (!paymentMethod || !['cash', 'upi'].includes(paymentMethod)) {
    res.status(400);
    throw new Error('Valid payment method (cash/upi) is required.');
  }

  const bill = await Bill.findById(billId);

  if (!bill) {
    res.status(404);
    throw new Error('Bill not found.');
  }

  if (bill.pharmacist.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to process this bill.');
  }

  if (bill.billStatus !== 'draft') {
    res.status(400);
    throw new Error('This bill has already been processed.');
  }

  // For UPI payment, verify transaction ID (in real implementation, verify with payment gateway)
  if (paymentMethod === 'upi') {
    if (!transactionId) {
      res.status(400);
      throw new Error('Transaction ID is required for UPI payments.');
    }
    // In real app, verify with Razorpay, PayTM, or other payment gateway
    // For now, we'll accept it if transactionId is provided
  }

  // Update bill payment details
  bill.paymentMethod = paymentMethod;
  bill.transactionId = transactionId || null;
  bill.paymentStatus = 'completed';
  bill.billStatus = 'completed';

  await bill.save();

  // Reduce medicine quantities in inventory
  try {
    for (const billMedicine of bill.medicines) {
      const medicine = await Medicine.findById(billMedicine.medicineId);
      if (medicine) {
        medicine.quantity -= billMedicine.quantity;
        if (medicine.quantity <= 0) {
          medicine.status = 'out_of_stock';
          medicine.quantity = 0;
        } else {
          medicine.status = 'instock';
        }
        await medicine.save();
      }
    }
  } catch (error) {
    // If inventory update fails, still return the bill creation response but log the error
    console.error('Inventory update error:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Payment processed successfully. Bill generated.',
    data: bill,
  });
});

/* ---------------------------------------------------------
   @desc    Get all bills for a pharmacist with pagination
   @route   GET /api/bills
   @access  Private (Pharmacist only)
   @query   { status, searchTerm, startDate, endDate, page, limit }
--------------------------------------------------------- */
const getBills = asyncHandler(async (req, res) => {
  const { status, searchTerm, startDate, endDate, page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageLimit = Math.max(1, Math.min(100, parseInt(limit) || 10));
  const skip = (pageNum - 1) * pageLimit;

  let query = { pharmacist: req.user._id };

  // Filter by bill status
  if (status && ['draft', 'completed', 'cancelled'].includes(status)) {
    query.billStatus = status;
  }

  // Search by bill number or customer name
  if (searchTerm) {
    query.$or = [
      { billNumber: { $regex: searchTerm, $options: 'i' } },
      { customerName: { $regex: searchTerm, $options: 'i' } },
      { customerPhone: { $regex: searchTerm, $options: 'i' } },
    ];
  }

  // Filter by date range
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  // Get total count for pagination
  const totalCount = await Bill.countDocuments(query);
  const totalPages = Math.ceil(totalCount / pageLimit);

  const bills = await Bill.find(query)
    .populate('medicines.medicineId', 'name category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  res.status(200).json({
    success: true,
    data: bills,
    pagination: {
      total: totalCount,
      count: bills.length,
      page: pageNum,
      limit: pageLimit,
      pages: totalPages,
    },
  });
});

/* ---------------------------------------------------------
   @desc    Get single bill by ID
   @route   GET /api/bills/:billId
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const getBillById = asyncHandler(async (req, res) => {
  const billId = req.params.billId;

  const bill = await Bill.findById(billId).populate('medicines.medicineId', 'name category');

  if (!bill) {
    res.status(404);
    throw new Error('Bill not found.');
  }

  if (bill.pharmacist.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this bill.');
  }

  res.status(200).json({
    success: true,
    data: bill,
  });
});

/* ---------------------------------------------------------
   @desc    Cancel a bill
   @route   PUT /api/bills/:billId/cancel
   @access  Private (Pharmacist only)
--------------------------------------------------------- */
const cancelBill = asyncHandler(async (req, res) => {
  const billId = req.params.billId;

  const bill = await Bill.findById(billId);

  if (!bill) {
    res.status(404);
    throw new Error('Bill not found.');
  }

  if (bill.pharmacist.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this bill.');
  }

  if (bill.billStatus === 'cancelled') {
    res.status(400);
    throw new Error('This bill has already been cancelled.');
  }

  // If bill was completed (paid), restore inventory
  if (bill.billStatus === 'completed') {
    try {
      for (const billMedicine of bill.medicines) {
        const medicine = await Medicine.findById(billMedicine.medicineId);
        if (medicine) {
          medicine.quantity += billMedicine.quantity;
          medicine.status = 'instock';
          await medicine.save();
        }
      }
    } catch (error) {
      console.error('Inventory restore error:', error);
    }
  }

  bill.billStatus = 'cancelled';
  bill.paymentStatus = 'cancelled';
  await bill.save();

  res.status(200).json({
    success: true,
    message: 'Bill cancelled successfully.',
    data: bill,
  });
});

/* ---------------------------------------------------------
   @desc    Get bill summary/stats with day-wise revenue
   @route   GET /api/bills/stats/summary
   @access  Private (Pharmacist only)
   @query   { startDate, endDate, days }
--------------------------------------------------------- */
const getBillStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, days = 7 } = req.query;

  let query = { pharmacist: req.user._id, billStatus: 'completed' };

  const formatLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parsedDays = Math.max(1, parseInt(days, 10) || 7);

  // Set date range
  const endDateObj = endDate ? new Date(endDate) : new Date();
  const startDateObj = startDate 
    ? new Date(startDate)
    : new Date(endDateObj.getTime() - (parsedDays - 1) * 24 * 60 * 60 * 1000);

  startDateObj.setHours(0, 0, 0, 0);
  endDateObj.setHours(23, 59, 59, 999);

  query.createdAt = {
    $gte: startDateObj,
    $lte: endDateObj,
  };

  const bills = await Bill.find(query).sort({ createdAt: 1 });

  // Aggregate data by day
  const dailyData = {};
  for (let d = new Date(startDateObj); d <= endDateObj; d.setDate(d.getDate() + 1)) {
    const dateKey = formatLocalDateKey(d);
    dailyData[dateKey] = {
      date: dateKey,
      revenue: 0,
      orders: 0,
      transactions: [],
    };
  }

  // Fill in actual data
  bills.forEach(bill => {
    const dateKey = formatLocalDateKey(new Date(bill.createdAt));
    if (dailyData[dateKey]) {
      dailyData[dateKey].revenue += bill.finalAmount;
      dailyData[dateKey].orders += 1;
      dailyData[dateKey].transactions.push({
        billNumber: bill.billNumber,
        amount: bill.finalAmount,
        method: bill.paymentMethod,
      });
    }
  });

  const dailyStats = Object.values(dailyData);
  const totalBills = bills.length;
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.finalAmount, 0);
  const avgBillAmount = totalBills > 0 ? totalRevenue / totalBills : 0;
  const cashPayments = bills.filter((b) => b.paymentMethod === 'cash').length;
  const upiPayments = bills.filter((b) => b.paymentMethod === 'upi').length;

  const medicineSalesMap = {};
  bills.forEach((bill) => {
    bill.medicines.forEach((medicine) => {
      const medicineId = String(medicine.medicineId);

      if (!medicineSalesMap[medicineId]) {
        medicineSalesMap[medicineId] = {
          medicineId,
          medicineName: medicine.medicineName,
          quantitySold: 0,
          revenue: 0,
        };
      }

      medicineSalesMap[medicineId].quantitySold += Number(medicine.quantity || 0);
      medicineSalesMap[medicineId].revenue += Number(medicine.subtotal || 0);
    });
  });

  const topSellingMedicines = Object.values(medicineSalesMap)
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalBills,
        totalRevenue: totalRevenue.toFixed(2),
        avgBillAmount: avgBillAmount.toFixed(2),
        paymentMethods: {
          cash: cashPayments,
          upi: upiPayments,
        },
      },
      dailyStats,
      topSellingMedicines,
      dateRange: {
        from: formatLocalDateKey(startDateObj),
        to: formatLocalDateKey(endDateObj),
      },
    },
  });
});

module.exports = {
  createBill,
  processBillPayment,
  getBills,
  getBillById,
  cancelBill,
  getBillStats,
};
