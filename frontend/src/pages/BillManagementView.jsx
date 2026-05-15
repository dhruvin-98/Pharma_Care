// frontend/src/pages/BillManagementView.jsx
// Bill Management - View all generated bills with pagination

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, Trash2, Download, Calendar, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const BillManagementView = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [pageLimit] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Details modal
  const [selectedBill, setSelectedBill] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch bills with pagination
  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageLimit,
      });

      if (searchTerm) params.append('searchTerm', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`${API_BASE_URL}/api/bills?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch bills');
      }

      const data = await res.json();
      setBills(data.data || []);
      setTotalBills(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError(err.message || 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageLimit, searchTerm, statusFilter, startDate, endDate]);

  // Fetch bills on mount and when filters change
  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Reset to first page when applying filters
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleCancelBill = async (billId) => {
    if (!window.confirm('Are you sure you want to cancel this bill?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/bills/${billId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to cancel bill');
      
      fetchBills();
      alert('Bill cancelled successfully');
    } catch (err) {
      alert(err.message || 'Error cancelling bill');
    }
  };

  const handlePrintBill = (bill) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .bill-info { margin: 20px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .items-table th { background-color: #f5f5f5; font-weight: bold; }
            .total-section { margin-top: 30px; text-align: right; }
            .total-row { font-size: 18px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>PHARMACY BILL RECEIPT</h2>
            <p>Bill #${bill.billNumber}</p>
          </div>

          <div class="bill-info">
            <p><strong>Customer:</strong> ${bill.customerName}</p>
            <p><strong>Phone:</strong> ${bill.customerPhone}</p>
            <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${bill.billStatus}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Qty</th>
                <th>Price/Unit</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${bill.medicines.map(item => `
                <tr>
                  <td>${item.medicineName}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.pricePerPacket.toFixed(2)}</td>
                  <td>₹${item.subtotal.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">Total Amount: ₹${bill.finalAmount.toFixed(2)}</div>
            <p><strong>Payment Method:</strong> ${bill.paymentMethod.toUpperCase()}</p>
            <p><strong>Status:</strong> ${bill.paymentStatus}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Bill Management</h2>
        <button
          onClick={() => fetchBills()}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bill or customer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleFilterChange();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              handleFilterChange();
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Start Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                handleFilterChange();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                handleFilterChange();
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setStartDate('');
              setEndDate('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bill #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Items</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Payment</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Loading bills...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No bills found
                  </td>
                </tr>
              ) : (
                bills.map(bill => (
                  <tr key={bill._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{bill.billNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{bill.customerName}</div>
                      <div className="text-xs text-gray-500">{bill.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{bill.medicines.length} items</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                      ₹{bill.finalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        bill.billStatus === 'completed' ? 'bg-green-100 text-green-700' :
                        bill.billStatus === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {bill.billStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {bill.paymentMethod.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowDetails(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrintBill(bill)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Print"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {bill.billStatus !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelBill(bill._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Cancel"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {bills.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {bills.length > 0 ? (currentPage - 1) * pageLimit + 1 : 0} to {Math.min(currentPage * pageLimit, totalBills)} of {totalBills} bills
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bill Details Modal */}
      {showDetails && selectedBill && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Bill Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Customer Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedBill.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedBill.customerPhone}</p>
                </div>
              </div>

              {/* Bill Items */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Items</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-2 text-left">Medicine</th>
                      <th className="px-2 py-2 text-center">Qty</th>
                      <th className="px-2 py-2 text-right">Price</th>
                      <th className="px-2 py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.medicines.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-2 py-2">{item.medicineName}</td>
                        <td className="px-2 py-2 text-center">{item.quantity}</td>
                        <td className="px-2 py-2 text-right">₹{item.pricePerPacket.toFixed(2)}</td>
                        <td className="px-2 py-2 text-right">₹{item.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold">₹{selectedBill.totalAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold">₹{selectedBill.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg">
                  <span className="font-semibold">Final Amount:</span>
                  <span className="font-bold text-green-600">₹{selectedBill.finalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Payment Method</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedBill.paymentMethod.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Payment Status</p>
                  <p className={`text-lg font-semibold ${selectedBill.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedBill.paymentStatus.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t p-6 flex gap-3">
              <button
                onClick={() => handlePrintBill(selectedBill)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Print Bill
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillManagementView;
