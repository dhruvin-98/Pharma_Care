// frontend/src/pages/UploadPrescriptionView.jsx

import React, { useState } from 'react';
import { Upload, FileText, Clock } from 'lucide-react';

const UploadPrescriptionView = () => {
  const [uploadedFile, setUploadedFile] = useState(null);   // preview
  const [selectedFile, setSelectedFile] = useState(null);   // actual file
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setUploadedFile(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setUploadedFile(URL.createObjectURL(file));
    }
  };

  // ------------------------
  //  Submit Prescription
  // ------------------------
  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please upload a prescription!");
      return;
    }

    const formData = new FormData();
    formData.append("prescriptionImage", selectedFile);
    formData.append("patientName", patientName);
    formData.append("phone", phone);
    formData.append("address", address);

    try {
      const res = await fetch(`${API_URL}/prescriptions/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Prescription uploaded successfully!");
        setUploadedFile(null);
        setSelectedFile(null);
        setPatientName("");
        setPhone("");
        setAddress("");
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
        <h2 className="text-4xl font-bold mb-2">Upload Prescription</h2>
        <p className="text-purple-100 text-lg">
          Get your medicines delivered quickly and safely
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Upload Your Prescription
          </h3>

          <div
            className={`border-3 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadedFile ? (
              <div className="space-y-4">
                <img src={uploadedFile} alt="Prescription" className="max-h-64 mx-auto rounded-lg" />

                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setSelectedFile(null);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Remove & Upload New
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                  <Upload className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Drop your prescription here or
                  </p>

                  <label className="cursor-pointer">
                    <span className="text-blue-600 font-semibold hover:underline">
                      browse files
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Supports: JPG, PNG, PDF (Max 5MB)</p>
              </div>
            )}
          </div>

          {uploadedFile && (
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Address
                </label>
                <textarea
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Submit Prescription
              </button>
            </div>
          )}
        </div>

        {/* Right section stays same */}
        {/* ... your How It Works + Quick Delivery sections ... */}
      </div>
    </div>
  );
};

export default UploadPrescriptionView;
