// frontend/src/pages/FindMedicineView.jsx

import React, { useState } from 'react';
import { Search, MapPin, Clock, Phone, Star, AlertTriangle } from 'lucide-react';

// Find Medicine View (Customer)
const FindMedicineView = ({ pharmacies }) => {
  const [searchMedicine, setSearchMedicine] = useState('');
  // const [selectedPharmacy, setSelectedPharmacy] = useState(null); // Not used in original, keeping it minimal

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h2 className="text-4xl font-bold mb-2">Find Medicine Nearby</h2>
        <p className="text-blue-100 text-lg">Get your medicines in 15 minutes or less</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
          <input
            type="text"
            placeholder="Search for medicine (e.g., Paracetamol, Amoxicillin)..."
            value={searchMedicine}
            onChange={(e) => setSearchMedicine(e.target.value)}
            className="w-full pl-14 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pharmacies.map(pharmacy => (
          <div key={pharmacy.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-300">
            <div className={`h-2 ${pharmacy.open ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{pharmacy.name}</h3>
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-700">{pharmacy.rating}</span>
                    <span className="text-gray-500 text-sm">(156 reviews)</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  pharmacy.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {pharmacy.open ? 'Open Now' : 'Closed'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-semibold text-gray-800">{pharmacy.distance}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3 text-blue-600" />
                  <span className="font-semibold text-gray-800">{pharmacy.time}</span>
                  <span className="text-green-600 ml-2 text-sm">● Available in 15 min</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-3 text-blue-600" />
                  <span>{pharmacy.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => window.open(`tel:${pharmacy.phone}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call</span>
                </button>
                <button 
                  onClick={() => window.open(`https://maps.google.com/?q=$${pharmacy.lat},${pharmacy.lng}`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Navigate</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
          Medicine Not Available Nearby?
        </h3>
        <p className="text-gray-600 mb-4">We can help you find it at other locations or arrange delivery.</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          Request Medicine
        </button>
      </div>
    </div>
  );
};

export default FindMedicineView;