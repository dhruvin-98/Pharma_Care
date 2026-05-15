// frontend/src/pages/InventoryView.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

// --- Component: MedicineModal (for Add/Edit) ---
const MedicineModal = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
  const [formData, setFormData] = useState({
    _id: initialData?._id || '',
    name: initialData?.name || '',
    category: initialData?.category || '',
    quantity: initialData?.quantity || 0,
    reorderLevel: initialData?.reorderLevel || 10,
    pricePerPacket: initialData?.pricePerPacket || 0.00,
    expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '', // YYYY-MM-DD format
    batchNumber: initialData?.batchNumber || '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        name: initialData.name,
        category: initialData.category,
        quantity: initialData.quantity,
        reorderLevel: initialData.reorderLevel,
        pricePerPacket: initialData.pricePerPacket,
        expiryDate: new Date(initialData.expiryDate).toISOString().split('T')[0],
        batchNumber: initialData.batchNumber || '',
      });
    } else {
      setFormData({
        _id: '',
        name: '',
        category: '',
        quantity: 0,
        reorderLevel: 10,
        pricePerPacket: 0.00,
        expiryDate: '',
        batchNumber: '',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (name === 'pricePerPacket' ? parseFloat(value) : parseInt(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.category || !formData.expiryDate || formData.pricePerPacket <= 0) {
      setError("Please fill in all required fields and ensure price is positive.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = formData._id ? 'PUT' : 'POST';
      const url = formData._id 
        ? `${API_BASE_URL}/api/inventory/${formData._id}`
        : `${API_BASE_URL}/api/inventory`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          quantity: formData.quantity,
          pricePerPacket: formData.pricePerPacket,
          expiryDate: formData.expiryDate,
          batchNumber: formData.batchNumber || null,
          reorderLevel: formData.reorderLevel,
        }),
      });

      const responseData = await res.json();
      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to save medicine');
      }

      onSubmit();
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving medicine');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 m-4">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-gray-800">{formData._id ? 'Edit Medicine' : 'Add New Medicine'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-700 font-medium">Medicine Name <span className="text-red-500">*</span></span>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Paracetamol 500mg" 
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-gray-700 font-medium">Category <span className="text-red-500">*</span></span>
              <input 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Pain Relief" 
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Batch Number</span>
              <input 
                type="text" 
                name="batchNumber" 
                value={formData.batchNumber} 
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., A123B" 
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="text-gray-700 font-medium">Quantity (Packets)</span>
              <input 
                type="number" 
                name="quantity" 
                value={formData.quantity} 
                onChange={handleChange} 
                min="0" 
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" 
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Reorder Level</span>
              <input 
                type="number" 
                name="reorderLevel" 
                value={formData.reorderLevel} 
                onChange={handleChange} 
                min="0" 
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" 
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-medium">Price/Packet (₹) <span className="text-red-500">*</span></span>
              <input 
                type="number" 
                name="pricePerPacket" 
                value={formData.pricePerPacket} 
                onChange={handleChange} 
                step="0.01" 
                min="0" 
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" 
              />
            </label>
          </div>

          <label className="block">
            <span className="text-gray-700 font-medium">Expiry Date <span className="text-red-500">*</span></span>
            <input 
              type="date" 
              name="expiryDate" 
              value={formData.expiryDate} 
              onChange={handleChange} 
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500" 
            />
          </label>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : formData._id ? 'Save Changes' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component: InventoryView ---
const InventoryView = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [pageLimit] = useState(10);
  const [categories, setCategories] = useState(['all']);

  // Fetch medicines from backend with pagination
  const fetchMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageLimit,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory !== 'all') params.append('category', filterCategory);

      const res = await fetch(`${API_BASE_URL}/api/inventory?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error('Failed to fetch medicines');
      
      setMedicines(data.data || []);
      setTotalMedicines(data.pagination.total);
      setTotalPages(data.pagination.pages);
      setError('');
      
      // Extract unique categories from all medicines
      const uniqueCategories = ['all', ...new Set(data.data.map(m => m.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('[InventoryView] Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageLimit, searchTerm, filterCategory]);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete medicine');
      fetchMedicines();
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddModal = () => {
    setEditingMedicine(null);
    setIsModalOpen(true);
  };

  const openEditModal = (medicine) => {
    setEditingMedicine(medicine);
    setIsModalOpen(true);
  };

  const handleModalSubmit = () => {
    setModalLoading(true);
    setTimeout(() => {
      setModalLoading(false);
      fetchMedicines();
    }, 500);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const timeDiff = expiry - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Inventory Management</h2>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors shadow-md"
        >
          <Plus className="h-5 w-5" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading medicines...</div>
          ) : (
            <>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-left border-b-2 border-blue-200">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Medicine</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Price/Packet</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Expiry</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {medicines.length > 0 ? (
                    medicines.map((medicine) => {
                      const daysToExpiry = getDaysUntilExpiry(medicine.expiryDate);
                      const isExpired = daysToExpiry < 0;
                      const isExpiringSoon = daysToExpiry <= 30 && daysToExpiry > 0;
                      const isLowStock = medicine.quantity <= medicine.reorderLevel;

                      return (
                        <tr key={medicine._id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{medicine.name}</div>
                            {medicine.batchNumber && (
                              <div className="text-xs text-gray-500">Batch: {medicine.batchNumber}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {medicine.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{medicine.quantity}</div>
                            <div className="text-xs text-gray-500">Min: {medicine.reorderLevel}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900">₹{medicine.pricePerPacket.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <div className={isExpired ? 'text-red-600 font-semibold' : isExpiringSoon ? 'text-orange-600 font-semibold' : 'text-gray-700'}>
                              {new Date(medicine.expiryDate).toLocaleDateString()}
                            </div>
                            {isExpired && <div className="text-xs text-red-500 font-bold">Expired!</div>}
                            {isExpiringSoon && <div className="text-xs text-orange-500">{daysToExpiry} days left</div>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${medicine.status === 'instock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {medicine.status === 'instock' ? 'In Stock' : 'Out of Stock'}
                              </span>
                              {isLowStock && (
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 flex space-x-2">
                            <button
                              onClick={() => openEditModal(medicine)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMedicine(medicine._id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No medicines found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {medicines.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {medicines.length > 0 ? (currentPage - 1) * pageLimit + 1 : 0} to {Math.min(currentPage * pageLimit, totalMedicines)} of {totalMedicines} medicines
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
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <MedicineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingMedicine}
        loading={modalLoading}
      />
    </div>
  );
};

export default InventoryView;