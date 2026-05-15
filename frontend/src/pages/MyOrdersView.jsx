// frontend/src/pages/MyOrdersView.jsx

import React, { useState } from 'react';
import { 
  ShoppingCart, Package, Truck, CheckCircle, Clock, 
  MapPin, Phone, Mail, Eye, Download, Star 
} from 'lucide-react';

const MyOrdersView = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Mock orders data
  const orders = [
    {
      id: 'ORD-2025-001',
      date: '2025-10-28',
      status: 'delivered',
      items: [
        { name: 'Paracetamol 500mg', quantity: 2, price: 15 },
        { name: 'Vitamin D3', quantity: 1, price: 450 }
      ],
      total: 480,
      pharmacy: 'MedPlus Pharmacy',
      address: '123 Main Street, Delhi',
      deliveryDate: '2025-10-30'
    },
    {
      id: 'ORD-2025-002',
      date: '2025-10-31',
      status: 'processing',
      items: [
        { name: 'Amoxicillin 500mg', quantity: 1, price: 120 },
        { name: 'Cough Syrup', quantity: 1, price: 85 }
      ],
      total: 205,
      pharmacy: 'Apollo Pharmacy',
      address: '123 Main Street, Delhi',
      estimatedDelivery: '2025-11-02'
    },
    {
      id: 'ORD-2025-003',
      date: '2025-11-01',
      status: 'pending',
      items: [
        { name: 'Insulin Injection', quantity: 3, price: 850 }
      ],
      total: 2550,
      pharmacy: 'HealthCare Pharmacy',
      address: '123 Main Street, Delhi',
      estimatedDelivery: '2025-11-03'
    }
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-12 w-12 text-blue-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Orders Yet</h3>
        <p className="text-gray-600 mb-6">
          Upload a prescription or browse medicines to place your first order
        </p>
        <button className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">My Orders</h2>
          <p className="text-gray-600 mt-1">Track and manage your orders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md p-2 flex space-x-2">
        {[
          { id: 'all', label: 'All Orders', count: orders.length },
          { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
          { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
          { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition ${
              activeTab === tab.id
                ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label} {tab.count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map(order => (
          <div 
            key={order.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-linear-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      Ordered on {new Date(order.date).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`flex items-center space-x-2 px-4 py-2 rounded-full border font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">₹{order.total}</div>
                    <div className="text-sm text-gray-600">{order.items.length} items</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Body */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-semibold text-gray-900">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-purple-600" />
                    Delivery Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm text-gray-600">Delivery Address</div>
                        <div className="font-medium text-gray-900">{order.address}</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm text-gray-600">Pharmacy</div>
                        <div className="font-medium text-gray-900">{order.pharmacy}</div>
                      </div>
                    </div>
                    {order.status === 'delivered' ? (
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm text-gray-600">Delivered On</div>
                          <div className="font-medium text-green-700">
                            {new Date(order.deliveryDate).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-3">
                        <Clock className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm text-gray-600">Estimated Delivery</div>
                          <div className="font-medium text-orange-700">
                            {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium">
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition font-medium">
                  <Download className="h-4 w-4" />
                  <span>Download Invoice</span>
                </button>
                {order.status === 'delivered' && (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium">
                    <Star className="h-4 w-4" />
                    <span>Rate Order</span>
                  </button>
                )}
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition font-medium ml-auto">
                  <Phone className="h-4 w-4" />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No {activeTab} Orders</h3>
          <p className="text-gray-600">You don't have any {activeTab} orders at the moment</p>
        </div>
      )}
    </div>
  );
};

export default MyOrdersView;