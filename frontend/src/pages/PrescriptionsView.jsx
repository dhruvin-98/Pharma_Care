// frontend/src/pages/PrescriptionsView.jsx

import React, { useState, useEffect } from 'react';
import { Pill, Calendar, X, Check, XCircle, ShoppingBag, FileText, User, Phone, MapPin, Activity } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const PrescriptionsView = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRx, setSelectedRx] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/prescriptions/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to load prescriptions from server');
      }
      const data = await res.json();
      setPrescriptions(data.prescriptions || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching orders & prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/prescriptions/approve/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Approval process failed');
      }

      alert('Order approved successfully! Inventory stocks have been adjusted.');
      fetchPrescriptions();
      if (selectedRx && selectedRx._id === id) {
        setSelectedRx(null);
      }
    } catch (err) {
      alert(err.message || 'Error approving order');
    }
  };

  const handleReject = async (id) => {
    const note = prompt('Please enter a rejection note / reason:', 'Out of stock or invalid credentials');
    if (note === null) return; // Cancelled prompt

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/prescriptions/reject/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pharmacistNote: note })
      });

      if (!res.ok) {
        throw new Error('Rejection failed');
      }

      alert('Order rejected successfully.');
      fetchPrescriptions();
      if (selectedRx && selectedRx._id === id) {
        setSelectedRx(null);
      }
    } catch (err) {
      alert(err.message || 'Error rejecting order');
    }
  };

  const filteredRx = prescriptions.filter(p => {
    if (filter === 'pending') return p.status === 'pending';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Prescriptions & Orders</h2>
          <p className="text-blue-100 text-sm mt-1">Review uploaded prescriptions and direct customer store orders.</p>
        </div>
        <div className="flex bg-white/15 backdrop-blur-md rounded-xl p-1 border border-white/10">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            All ({prescriptions.length})
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            Pending ({prescriptions.filter(p => p.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Loading & Errors */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 font-medium text-sm">Loading active queue...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-100 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      ) : (
        <>
          {filteredRx.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRx.map(rx => (
                <div 
                  key={rx._id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                >
                  <div>
                    {/* Media / Receipt Area */}
                    {rx.isDirectOrder ? (
                      /* Render Direct Order Receipt */
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-gray-900 dark:to-gray-850 h-48 flex flex-col justify-between border-b border-gray-100 dark:border-gray-800 relative">
                        <div className="flex justify-between items-start">
                          <span className="flex items-center text-[10px] font-extrabold uppercase bg-blue-600 text-white px-2 py-0.5 rounded-md shadow-sm">
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            Direct Store Order
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            rx.status === 'pending' ? 'bg-amber-500 text-white' : (rx.status === 'approved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                          }`}>
                            {rx.status}
                          </span>
                        </div>
                        <div className="space-y-1 overflow-y-auto max-h-24 pr-1 my-2 text-xs">
                          {rx.medicines.map((med, i) => (
                            <div key={i} className="flex justify-between text-gray-700 dark:text-gray-300 font-semibold">
                              <span className="truncate max-w-[70%]">{med.medicineName} (x{med.quantity})</span>
                              <span className="font-mono text-gray-500">₹{med.subtotal}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-xs font-bold text-gray-500">Bill Total:</span>
                          <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">₹{rx.totalAmount}</span>
                        </div>
                      </div>
                    ) : (
                      /* Render Uploaded Image Prescription */
                      <div className="relative h-48 bg-gray-100 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                        <img 
                          src={`${API_BASE_URL}${rx.imageUrl}`} 
                          alt="Prescription Scan" 
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setSelectedRx(rx)}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80";
                          }}
                        />
                        <div className="absolute top-3 left-3 flex justify-between items-start w-[calc(100%-1.5rem)]">
                          <span className="flex items-center text-[10px] font-extrabold uppercase bg-purple-600 text-white px-2 py-0.5 rounded-md shadow-sm">
                            <FileText className="h-3 w-3 mr-1" />
                            Scanned Prescription
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            rx.status === 'pending' ? 'bg-amber-500 text-white' : (rx.status === 'approved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                          }`}>
                            {rx.status}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Patient & Order details */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-850 dark:text-white mb-0.5 truncate">{rx.patientName}</h3>
                        <p className="text-[11px] font-mono text-gray-400">ID: {rx._id}</p>
                      </div>

                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2.5 text-blue-600 flex-shrink-0" />
                          <span>Placed: {new Date(rx.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2.5 text-blue-600 flex-shrink-0" />
                          <span>Phone: {rx.phone}</span>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{rx.address}</span>
                        </div>
                        {rx.pharmacistNote && (
                          <div className="bg-rose-50/50 dark:bg-rose-950/10 p-2 rounded-lg text-rose-700 dark:text-rose-400 border border-rose-100/30 text-[11px] font-semibold">
                            Note: {rx.pharmacistNote}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  {rx.status === 'pending' && (
                    <div className="p-5 pt-0 grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleApprove(rx._id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-md shadow-green-500/10 cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button 
                        onClick={() => handleReject(rx._id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-md shadow-rose-500/10 cursor-pointer flex items-center justify-center space-x-1"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-16 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Active Submissions</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                No orders or prescription uploads match the current queue view filter.
              </p>
            </div>
          )}
        </>
      )}

      {/* Scanned prescription image zoom modal */}
      {selectedRx && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all"
          onClick={() => setSelectedRx(null)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Prescription Document Scan</h3>
                <p className="text-xs text-gray-500">{selectedRx.patientName}</p>
              </div>
              <button 
                onClick={() => setSelectedRx(null)} 
                className="text-gray-450 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-auto flex justify-center bg-gray-50 dark:bg-gray-900 max-h-[60vh]">
              <img 
                src={`${API_BASE_URL}${selectedRx.imageUrl}`} 
                alt="Zoomed Scan" 
                className="max-w-full rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80";
                }}
              />
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <p><strong>Handover Address:</strong> {selectedRx.address}</p>
                  <p><strong>Contact Phone:</strong> {selectedRx.phone}</p>
                </div>
                {selectedRx.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => handleApprove(selectedRx._id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md cursor-pointer flex items-center space-x-1"
                    >
                      <Check className="h-4.5 w-4.5" />
                      <span>Approve Scan</span>
                    </button>
                    <button 
                      onClick={() => handleReject(selectedRx._id)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md cursor-pointer flex items-center space-x-1"
                    >
                      <XCircle className="h-4.5 w-4.5" />
                      <span>Reject Scan</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsView;