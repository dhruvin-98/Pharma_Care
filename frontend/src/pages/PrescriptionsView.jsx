// frontend/src/pages/PrescriptionsView.jsx
import React, { useState } from 'react';
import { Pill, Calendar, X } from 'lucide-react';

// Prescriptions View
const PrescriptionsView = ({ prescriptions }) => {
  const [selectedRx, setSelectedRx] = useState(null);

  const approveRx = async (id) => {
  await fetch(`${API_URL}/prescriptions/approve/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });

  refresh();
};

const rejectRx = async (id) => {
  await fetch(`${API_URL}/prescriptions/reject/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ pharmacistNote: "Not valid" }),
  });

  refresh();
};


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Prescription Management</h2>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
            All ({prescriptions.length})
          </button>
          <button className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors">
            Pending ({prescriptions.filter(p => p.status === 'pending').length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prescriptions.map(rx => (
          <div key={rx.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
            <div className="relative h-48 bg-linear-to-br from-blue-50 to-blue-100">
              <img 
                src={rx.image} 
                alt="Prescription" 
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setSelectedRx(rx)}
              />
              <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                rx.status === 'pending' ? 'bg-orange-500' : 'bg-green-500'
              } text-white`}>
                {rx.status.toUpperCase()}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{rx.patientName}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Uploaded: {rx.uploadDate}</span>
                </div>
                <div className="flex items-center">
                  <Pill className="h-4 w-4 mr-2 text-blue-600" />
                  <span>{rx.medicines.join(', ')}</span>
                </div>
              </div>
              {rx.status === 'pending' && (
                <div className="flex space-x-2">
                  <button className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                    Approve
                  </button>
                  <button className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedRx && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRx(null)}
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Prescription Details</h3>
                <button onClick={() => setSelectedRx(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <img src={selectedRx.image} alt="Prescription" className="w-full rounded-lg mb-4" />
              <div className="space-y-2">
                <p><strong>Patient:</strong> {selectedRx.patientName}</p>
                <p><strong>Upload Date:</strong> {selectedRx.uploadDate}</p>
                <p><strong>Medicines:</strong> {selectedRx.medicines.join(', ')}</p>
                <p><strong>Status:</strong> <span className={`font-semibold ${selectedRx.status === 'pending' ? 'text-orange-600' : 'text-green-600'}`}>{selectedRx.status}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionsView;