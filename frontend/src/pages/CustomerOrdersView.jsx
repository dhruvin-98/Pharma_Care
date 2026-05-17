// frontend/src/pages/CustomerOrdersView.jsx

import React, { useState, useEffect } from 'react';
import { ShoppingBag, FileText, Calendar, DollarSign, Clock, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

const CustomerOrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Retrieve logged-in user details to get their user ID
      const userInfo = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('user_auth')) || {};
      const userId = userInfo.id || userInfo._id;

      if (!userId) {
        throw new Error('User session not found. Please log in again.');
      }

      const res = await fetch(`${API_BASE_URL}/api/prescriptions/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to retrieve your order history.');
      }

      const data = await res.json();
      setOrders(data.prescriptions || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error connecting to order server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-6 text-white shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">My Orders</h2>
          <p className="text-purple-100 text-sm mt-1">Track and manage your direct store order checkouts and statuses.</p>
        </div>
        <button 
          onClick={fetchMyOrders}
          disabled={loading}
          className="bg-white/15 hover:bg-white/25 border border-white/10 text-white font-semibold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
        >
          Refresh Tracker
        </button>
      </div>

      {/* Loading & Errors */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="text-gray-500 font-medium text-sm">Synchronizing purchase ledger...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 p-4 rounded-xl border border-rose-150 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map(order => (
            <div 
              key={order._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-150 dark:border-gray-700 flex flex-col justify-between"
            >
              {/* Top Banner Status Bar */}
              <div className={`h-1.5 ${
                order.status === 'approved' 
                  ? 'bg-emerald-500' 
                  : (order.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500')
              }`}></div>

              <div className="p-6 space-y-4">
                {/* Header Block */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="flex items-center text-[10px] font-extrabold uppercase bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-850">
                      {order.isDirectOrder ? (
                        <>
                          <ShoppingBag className="h-3 w-3 mr-1 text-indigo-600" />
                          Direct Store Checkout
                        </>
                      ) : (
                        <>
                          <FileText className="h-3 w-3 mr-1 text-purple-600" />
                          Prescription Scan
                        </>
                      )}
                    </span>
                    <p className="text-[10px] font-mono text-gray-400 mt-2">Order Ref: {order._id}</p>
                  </div>

                  <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold shadow-sm capitalize ${
                    order.status === 'approved' 
                      ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' 
                      : (order.status === 'rejected' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300')
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Items & Receipt List */}
                {order.isDirectOrder ? (
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl space-y-2 border border-gray-100 dark:border-gray-850">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ordered Products</p>
                    <div className="space-y-1.5 overflow-y-auto max-h-24 pr-1 text-xs">
                      {order.medicines.map((med, i) => (
                        <div key={i} className="flex justify-between font-semibold text-gray-700 dark:text-gray-300">
                          <span className="truncate max-w-[70%]">{med.medicineName} (x{med.quantity})</span>
                          <span className="font-mono text-gray-500">₹{med.subtotal}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                      <span className="text-xs font-bold text-gray-500">Total Price:</span>
                      <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">₹{order.totalAmount}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3.5 bg-gray-50 dark:bg-gray-900/30 p-3.5 rounded-xl border border-gray-100 dark:border-gray-850">
                    <img 
                      src={`${API_BASE_URL}${order.imageUrl}`} 
                      alt="Rx Scan" 
                      className="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-700" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80";
                      }}
                    />
                    <div>
                      <p className="font-bold text-gray-850 dark:text-white text-sm">Uploaded Scanned File</p>
                      <p className="text-xs text-gray-500">Patient: {order.patientName}</p>
                    </div>
                  </div>
                )}

                {/* Delivery and Placement Info */}
                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-750">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2.5 text-indigo-500 flex-shrink-0" />
                    <span>Placed on: {new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  {order.pharmacistNote && (
                    <div className={`p-3 rounded-xl flex items-start space-x-2 border text-xs font-semibold ${
                      order.status === 'rejected'
                        ? 'bg-rose-50/50 dark:bg-rose-950/10 text-rose-700 dark:text-rose-450 border-rose-100 dark:border-rose-900/20'
                        : 'bg-indigo-50/50 dark:bg-indigo-950/10 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/20'
                    }`}>
                      {order.status === 'rejected' ? (
                        <XCircle className="h-4.5 w-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold">{order.status === 'rejected' ? 'Rejection Note' : 'Pharmacist Note'}</p>
                        <p className="font-medium text-gray-650 dark:text-gray-400">{order.pharmacistNote}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-250 dark:border-gray-700 p-16 text-center shadow-sm">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Orders Placed Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            You haven't checked out any direct medical orders yet. Visit the Find Medicine catalog to search, configure a basket, and submit your first order!
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerOrdersView;
