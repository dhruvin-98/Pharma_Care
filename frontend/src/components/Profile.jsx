// frontend/src/components/Profile.jsx

import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, 
  Camera, Shield, Building, Briefcase, Clock, CheckCircle
} from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pharmacyName: '',
    licenseNumber: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const auth = JSON.parse(localStorage.getItem('user_auth'));
    if (!auth?.token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          pharmacyName: data.pharmacyName || '',
          licenseNumber: data.licenseNumber || ''
        });
      }
    } catch (err) {
      console.error("Profile fetch failed:", err);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    const auth = JSON.parse(localStorage.getItem('user_auth'));
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Update localStorage
        localStorage.setItem('user_profile', JSON.stringify(updatedUser));
        
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (err) {
      console.error("Update failed:", err);
      setMessage({ type: 'error', text: 'An error occurred while updating' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      pharmacyName: user?.pharmacyName || '',
      licenseNumber: user?.licenseNumber || ''
    });
    setMessage({ type: '', text: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const getRoleDisplayName = () => {
    if (user?.userType === 'admin') return 'Administrator';
    if (user?.userType === 'pharmacist') return 'Pharmacist';
    if (user?.userType === 'customer') return 'Customer';
    return 'User';
  };

  const getRoleColor = () => {
    if (user?.userType === 'admin') return 'from-purple-500 to-indigo-600';
    if (user?.userType === 'pharmacist') return 'from-blue-500 to-cyan-600';
    return 'from-green-500 to-teal-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          <div className={`bg-gradient-to-r ${getRoleColor()} h-32 relative`}>
            <div className="absolute -bottom-16 left-8">
              <div className="relative group">
                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl ring-8 ring-white">
                  <User className="h-16 w-16 text-white" />
                </div>
                <button className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-all transform hover:scale-110">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-20 pb-6 px-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.name || 'User'}
                </h1>
                <div className="flex items-center space-x-3">
                  <span className={`bg-gradient-to-r ${getRoleColor()} text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-md`}>
                    {getRoleDisplayName()}
                  </span>
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                </div>
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="font-semibold">Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl transition-all"
                  >
                    <X className="h-4 w-4" />
                    <span className="font-semibold">Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span className="font-semibold">{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border-2 border-green-200 text-green-800' 
              : 'bg-red-50 border-2 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
              <span className="font-semibold">{message.text}</span>
            </div>
          </div>
        )}

        {/* Profile Information Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <User className="h-4 w-4 text-blue-600" />
                <span>Full Name</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                  {user?.name || 'Not provided'}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Mail className="h-4 w-4 text-blue-600" />
                <span>Email Address</span>
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                {user?.email || 'Not provided'}
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Phone className="h-4 w-4 text-blue-600" />
                <span>Phone Number</span>
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                  {user?.phone || 'Not provided'}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Address</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  placeholder="Enter address"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                  {user?.address || 'Not provided'}
                </div>
              )}
            </div>

            {/* Pharmacist-specific fields */}
            {user?.userType === 'pharmacist' && (
              <>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span>Pharmacy Name</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="pharmacyName"
                      value={formData.pharmacyName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      placeholder="Enter pharmacy name"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                      {user?.pharmacyName || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <span>License Number</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      placeholder="Enter license number"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                      {user?.licenseNumber || 'Not provided'}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Member Since */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>Member Since</span>
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 font-medium">
                {user?.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Not available'}
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Account Status</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">Active</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Verification</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">Verified</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Last Login</p>
                <p className="text-lg font-bold text-gray-900 mt-1">Today</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;