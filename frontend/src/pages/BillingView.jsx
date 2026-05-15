// frontend/src/pages/BillingView.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, X, Search, Trash2, AlertCircle, DollarSign, PhoneIcon } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

// --- Bill Items Modal ---
const AddItemModal = ({ isOpen, onClose, onAddItems, medicines, currentItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState({});

  const filteredMedicines = (Array.isArray(medicines) ? medicines : []).filter(
    (medicine) => medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      medicine.status === 'instock' &&
      medicine.quantity > 0 &&
      !currentItems.some(item => item.medicineId === medicine._id)
  );

  const toggleMedicineSelection = (medicine) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[medicine._id]) {
        delete next[medicine._id];
      } else {
        next[medicine._id] = 1;
      }
      return next;
    });
  };

  const updateQuantity = (medicine, value) => {
    if (value === '') {
      setSelectedItems((prev) => ({
        ...prev,
        [medicine._id]: '',
      }));
      return;
    }

    const parsedValue = parseInt(value, 10);
    const safeValue = Number.isNaN(parsedValue) ? '' : Math.max(1, Math.min(parsedValue, medicine.quantity));

    setSelectedItems((prev) => ({
      ...prev,
      [medicine._id]: safeValue,
    }));
  };

  const handleAddSelectedItems = () => {
    const selectedMedicineIds = Object.keys(selectedItems);

    if (selectedMedicineIds.length === 0) {
      alert('Please select at least one medicine');
      return;
    }

    const medicinesMap = new Map(filteredMedicines.map((medicine) => [medicine._id, medicine]));
    const itemsToAdd = [];

    for (const medicineId of selectedMedicineIds) {
      const medicine = medicinesMap.get(medicineId);
      if (!medicine) continue;

      const quantity = parseInt(selectedItems[medicineId], 10);
      if (!quantity || quantity <= 0) continue;
      if (quantity > medicine.quantity) {
        alert(`Only ${medicine.quantity} packets available for ${medicine.name}`);
        return;
      }

      itemsToAdd.push({
        medicineId: medicine._id,
        medicineName: medicine.name,
        category: medicine.category,
        quantity,
        pricePerPacket: medicine.pricePerPacket,
        subtotal: medicine.pricePerPacket * quantity,
      });
    }

    if (itemsToAdd.length === 0) {
      alert('No valid medicines selected');
      return;
    }

    onAddItems(itemsToAdd);
    setSearchTerm('');
    setSelectedItems({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold">Add Medicine</h3>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Medicine
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Medicine list */}
          <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map(medicine => (
                <div
                  key={medicine._id}
                  className={`px-4 py-3 border-b transition ${
                    Object.prototype.hasOwnProperty.call(selectedItems, medicine._id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={Object.prototype.hasOwnProperty.call(selectedItems, medicine._id)}
                        onChange={() => toggleMedicineSelection(medicine)}
                        className="h-4 w-4"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-xs text-gray-500">
                          ₹{medicine.pricePerPacket} • {medicine.quantity} available
                        </div>
                      </div>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={medicine.quantity}
                      value={selectedItems[medicine._id] ?? 1}
                      disabled={!Object.prototype.hasOwnProperty.call(selectedItems, medicine._id)}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => updateQuantity(medicine, e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                {medicines.length === 0 ? 'No medicines available' : 'No matching medicines'}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            Selected items: <span className="font-semibold text-gray-900">{Object.keys(selectedItems).length}</span>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSelectedItems}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={Object.keys(selectedItems).length === 0}
            >
              Add Selected Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Payment Modal ---
const PaymentModal = ({ isOpen, onClose, billTotal, onPayment, processing }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [upiId, setUpiId] = useState('');

  const handlePayment = () => {
    if (paymentMethod === 'upi' && !upiId) {
      alert('Please enter UPI ID');
      return;
    }

    onPayment(paymentMethod, upiId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold">Payment</h3>
          <button onClick={onClose} disabled={processing}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Bill Total */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-3xl font-bold text-gray-900">₹{billTotal.toFixed(2)}</div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50" style={{borderColor: paymentMethod === 'cash' ? '#2563eb' : ''}}>
              <input
                type="radio"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
                disabled={processing}
              />
              <span className="font-medium">Cash Payment</span>
            </label>

            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50" style={{borderColor: paymentMethod === 'upi' ? '#2563eb' : ''}}>
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
                disabled={processing}
              />
              <span className="font-medium">UPI Payment</span>
            </label>
          </div>

          {/* UPI Section */}
          {paymentMethod === 'upi' && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              {/* Dummy QR Code */}
              <div className="bg-white p-4 rounded-lg flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="inline-block w-40 h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-500">●●●</div>
                      <div className="text-xs text-gray-600 mt-2">Scan QR Code</div>
                      <div className="text-xs text-gray-600">₹{billTotal.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">Demo QR Code</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID / Transaction ID</label>
                <input
                  type="text"
                  placeholder="user@upi or transaction ID"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={processing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Billing Component ---
const BillingView = () => {
  const [medicines, setMedicines] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedBill, setGeneratedBill] = useState(null);

  // Fetch medicines
  const fetchMedicines = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/inventory?page=1&limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error('Failed to fetch medicines');
      setMedicines(data.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const billTotal = billItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleAddItems = (items) => {
    setBillItems((prevItems) => [
      ...prevItems,
      ...items.map((item, index) => ({
        ...item,
        id: `${Date.now()}-${index}`,
      })),
    ]);
    setSuccess(`${items.length} item(s) added to bill`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleRemoveItem = (itemId) => {
    setBillItems(billItems.filter(item => item.id !== itemId));
  };

  const handleCreateBill = async () => {
    setError('');

    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Please enter customer name and phone');
      return;
    }

    if (billItems.length === 0) {
      setError('Please add medicines to the bill');
      return;
    }

    setShowPaymentModal(true);
  };

  const handlePayment = async (paymentMethod, upiId) => {
    try {
      setPaymentProcessing(true);
      const token = localStorage.getItem('token');

      // Step 1: Create bill draft
      const billRes = await fetch(`${API_BASE_URL}/api/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          medicines: billItems.map(item => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
          })),
        }),
      });

      if (!billRes.ok) throw new Error('Failed to create bill');
      const bill = await billRes.json();

      // Step 2: Process payment
      const paymentRes = await fetch(`${API_BASE_URL}/api/bills/${bill.data._id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod,
          transactionId: paymentMethod === 'upi' ? upiId : null,
        }),
      });

      if (!paymentRes.ok) throw new Error('Failed to process payment');
      const paidBill = await paymentRes.json();

      // Success
      setGeneratedBill(paidBill.data);
      setShowPaymentModal(false);
      setBillItems([]);
      setCustomerName('');
      setCustomerPhone('');
      setSuccess('Bill generated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Display generated bill
  if (generatedBill) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Bill Header */}
          <div className="text-center border-b-2 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">PharmaCare Bill</h1>
            <div className="text-gray-600 mt-2">Bill No. {generatedBill.billNumber}</div>
            <div className="text-sm text-gray-600">
              Date: {new Date(generatedBill.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <div className="text-sm text-gray-600">Customer Name</div>
              <div className="text-lg font-semibold text-gray-900">{generatedBill.customerName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Phone</div>
              <div className="text-lg font-semibold text-gray-900">{generatedBill.customerPhone}</div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="border-y-2 border-gray-300">
                <th className="text-left py-3 font-semibold text-gray-900">Medicine</th>
                <th className="text-right py-3 font-semibold text-gray-900">Price</th>
                <th className="text-center py-3 font-semibold text-gray-900">Qty</th>
                <th className="text-right py-3 font-semibold text-gray-900">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {generatedBill.medicines.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-3 text-gray-900">{item.medicineName}</td>
                  <td className="text-right text-gray-900">₹{item.pricePerPacket.toFixed(2)}</td>
                  <td className="text-center text-gray-900">{item.quantity}</td>
                  <td className="text-right text-gray-900">₹{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b-2 border-gray-300">
                <span className="font-semibold">Total Amount</span>
                <span className="font-semibold">₹{generatedBill.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-green-600">₹{generatedBill.finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Payment Method</div>
              <div className="font-semibold text-gray-900 capitalize">{generatedBill.paymentMethod}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Payment Status</div>
              <div className="font-semibold text-green-600">{generatedBill.paymentStatus}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-center pt-6">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Print Bill
            </button>
            <button
              onClick={() => {
                setGeneratedBill(null);
                fetchMedicines();
              }}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Create New Bill
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Create Bill</h2>
      </div>

      {/* Error/Success messages */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Bill Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Customer Information</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Customer Name *</span>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter customer name"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Phone Number *</span>
                <div className="relative mt-1">
                  <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Medicine Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Medicines</h3>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            {billItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 font-semibold text-gray-700">Medicine</th>
                      <th className="text-right py-2 font-semibold text-gray-700">Price</th>
                      <th className="text-center py-2 font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-2 font-semibold text-gray-700">Subtotal</th>
                      <th className="text-center py-2 font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 text-gray-900">{item.medicineName}</td>
                        <td className="text-right text-gray-900">₹{item.pricePerPacket.toFixed(2)}</td>
                        <td className="text-center text-gray-900">{item.quantity}</td>
                        <td className="text-right font-semibold text-gray-900">₹{item.subtotal.toFixed(2)}</td>
                        <td className="text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No items added yet. Click "Add Item" to add medicines.
              </div>
            )}
          </div>
        </div>

        {/* Right: Bill Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Bill Summary</h3>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-700">Items Count</span>
              <span className="font-semibold text-gray-900">{billItems.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-700">Total Quantity</span>
              <span className="font-semibold text-gray-900">{billItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold py-4 bg-gray-50 px-3 rounded-lg">
              <span>Total Amount</span>
              <span className="text-green-600">₹{billTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCreateBill}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={billItems.length === 0 || !customerName || !customerPhone}
          >
            <DollarSign className="h-5 w-5" />
            Proceed to Payment
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onAddItems={handleAddItems}
        medicines={medicines}
        currentItems={billItems}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        billTotal={billTotal}
        onPayment={handlePayment}
        processing={paymentProcessing}
      />
    </div>
  );
};

export default BillingView;
