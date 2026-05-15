// frontend/src/components/AddEditMedicineModal.jsx

import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/inventory';

// Default state for a new medicine
const initialFormState = {
    name: '',
    batch: '',
    category: 'Tablet', // Default category
    stock: 0,
    reorderLevel: 10,
    price: 0.01,
    expiry: '', // YYYY-MM-DD format
};

const AddEditMedicineModal = ({
    isOpen,
    onClose,
    currentMedicine, // The medicine object to edit, or null for adding
    onSaveSuccess,   // Callback to refresh inventory after save
}) => {
    const isEditing = !!currentMedicine;
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Effect to pre-fill form when editing
    useEffect(() => {
        if (currentMedicine) {
            // Format expiry date for input type="date" (YYYY-MM-DD)
            const expiryDate = currentMedicine.expiry ? new Date(currentMedicine.expiry).toISOString().substring(0, 10) : '';

            setFormData({
                ...currentMedicine,
                expiry: expiryDate,
                // Ensure stock and price are treated as numbers
                stock: currentMedicine.stock || 0,
                price: currentMedicine.price || 0.01,
                reorderLevel: currentMedicine.reorderLevel || 10,
            });
        } else {
            setFormData(initialFormState);
        }
    }, [currentMedicine, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            // Convert numbers to float/int, handle standard text otherwise
            [name]: type === 'number' ? parseFloat(value) : value,
        });
    };

    const getAuthToken = () => {
        // Retrieve the token from local storage (must match AuthPage implementation)
        const authData = JSON.parse(localStorage.getItem('user_auth'));
        return authData ? `Bearer ${authData.token}` : '';
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic Validation
        if (!formData.name || !formData.batch || !formData.category || formData.stock === null || formData.price <= 0 || !formData.expiry) {
            setError("Please fill out all fields correctly.");
            setLoading(false);
            return;
        }

        const endpoint = isEditing ? `${API_BASE_URL}/${currentMedicine._id}` : API_BASE_URL;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': getAuthToken(), // Send the token
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                // If backend returns HTML error page (due to unhandled error/crash), this helps
                const message = data.message || `API error (${response.status}). Check server console.`;
                throw new Error(message);
            }

            onSaveSuccess(data); // Refresh the parent view
            onClose(); // Close modal on success

        } catch (err) {
            console.error('API Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-blue-600 flex items-center space-x-2">
                        {isEditing ? 'Edit Medicine' : 'Add New Medicine'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                    <InputField label="Medicine Name" name="name" value={formData.name} onChange={handleInputChange} required />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Batch Number" name="batch" value={formData.batch} onChange={handleInputChange} required />
                        <InputField label="Category" name="category" value={formData.category} onChange={handleInputChange} required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <InputField label="Stock Quantity" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required min={0} />
                        <InputField label="Reorder Level" name="reorderLevel" type="number" value={formData.reorderLevel} onChange={handleInputChange} required min={0} />
                        <InputField label="Price (₹)" name="price" type="number" value={formData.price} onChange={handleInputChange} required min={0.01} step={0.01} />
                    </div>
                    <InputField label="Expiry Date" name="expiry" type="date" value={formData.expiry} onChange={handleInputChange} required />

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center space-x-2"
                        >
                            {loading ? (
                                'Saving...'
                            ) : (
                                <>
                                    {isEditing ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                    <span>{isEditing ? 'Save Changes' : 'Add to Inventory'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Simple reusable Input Field component
const InputField = ({ label, name, type = 'text', value, onChange, required = false, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            {...props}
        />
    </div>
);

export default AddEditMedicineModal;