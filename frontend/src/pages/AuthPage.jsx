import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Smartphone,
  User,
  Users,
  X,
} from 'lucide-react';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth`;

const buildMapEmbedUrl = (latitude, longitude) => {
  const delta = 0.01;
  const left = longitude - delta;
  const right = longitude + delta;
  const top = latitude + delta;
  const bottom = latitude - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`;
};

const buildGoogleMapsUrl = (latitude, longitude) =>
  `https://www.google.com/maps?q=${latitude},${longitude}`;

const AuthPage = ({
  onLogin,
  hidePageShell = false,
  onModalClose,
  initialRole = 'customer',
  initialMode = 'register',
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authMode, setAuthMode] = useState(initialMode === 'login' ? 'login' : 'register');
  const [step, setStep] = useState(1);
  const [otpChannel, setOtpChannel] = useState('email');
  const [otpTarget, setOtpTarget] = useState('email');
  const [userType, setUserType] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    password: '',
    otp: '',
    pharmacyName: '',
    licenseNumber: '',
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [geoLocation, setGeoLocation] = useState(null);

  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });

  const hasPhone = useMemo(() => Boolean(formData.phone.replace(/\D/g, '')), [formData.phone]);

  useEffect(() => {
    const authData = localStorage.getItem('user_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const initialView = getInitialAuthView(parsed.userType);
        navigate(`/app/${initialView}`);
      } catch {
        localStorage.removeItem('user_auth');
      }
    }
  }, [navigate]);

  useEffect(() => {
    if (hidePageShell) return;

    const params = new URLSearchParams(location.search);
    const shouldOpenRegister = ['1', 'true', 'yes'].includes((params.get('register') || '').toLowerCase());
    const requestedRole = (params.get('role') || '').toLowerCase();
    const requestedMode = (params.get('mode') || '').toLowerCase();

    if (requestedMode === 'login') {
      setAuthMode('login');
      setError('');
      setSuccess('');
      setShowAuthModal(true);
    }

    if (shouldOpenRegister) {
      setAuthMode('register');
      setStep(1);
      setError('');
      setSuccess('');
      setShowAuthModal(true);
    }

    if (requestedRole === 'pharmacist') {
      setUserType('pharmacist');
    } else {
      setUserType('customer');
    }
  }, [location.search, hidePageShell]);

  useEffect(() => {
    if (initialRole === 'pharmacist') {
      setUserType('pharmacist');
    } else {
      setUserType('customer');
    }

    if (hidePageShell) {
      setAuthMode(initialMode === 'login' ? 'login' : 'register');
      setShowAuthModal(true);
      setStep(1);
      setError('');
      setSuccess('');
    }
  }, [initialRole, hidePageShell, initialMode]);

  const getInitialAuthView = (role) => {
    if (role === 'admin' || role === 'pharmacist') return 'dashboard';
    if (role === 'customer') return 'find-medicine';
    return 'dashboard';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      password: '',
      otp: '',
      pharmacyName: '',
      licenseNumber: '',
    });
    setStep(1);
    setOtpChannel('email');
    setOtpTarget('email');
    setUserType('customer');
    setError('');
    setSuccess('');
    setGeoLocation(null);
    setShowLocationModal(false);
  };

  const closeModal = () => {
    resetForm();

    if (onModalClose) {
      setShowAuthModal(false);
      onModalClose();
      return;
    }

    navigate('/');
  };

  const persistAuthSession = (data) => {
    const authData = {
      token: data.token,
      userType: data.user.userType,
      userId: data.user._id,
      name: data.user.name,
      email: data.user.email,
      phone: data.user.phone,
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('user_auth', JSON.stringify(authData));
  };

  const handleLoginInputChange = (event) => {
    const { name, value } = event.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const identifier = loginData.identifier.trim();
      const password = loginData.password;

      if (!identifier) throw new Error('Email or phone is required');
      if (!password || password.length < 6) throw new Error('Valid password is required');

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, userType }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Login failed');

      persistAuthSession(data);

      setShowAuthModal(false);
      onLogin(data.user.userType);

      const initialView = getInitialAuthView(data.user.userType);
      navigate(`/app/${initialView}`);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === 'phone') {
      const clean = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: clean }));
      if (!clean) setOtpChannel('email');
      return;
    }

    if (name === 'pincode') {
      const clean = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, pincode: clean }));
      return;
    }

    if (name === 'otp') {
      const clean = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, otp: clean }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateRegistration = () => {
    if (!formData.name.trim()) return 'Full name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.state.trim()) return 'State is required';
    if (!/^\d{6}$/.test(formData.pincode)) return 'Pincode must be 6 digits';
    if (hasPhone && formData.phone.length !== 10) return 'Phone number must be 10 digits';
    if (!formData.password.trim()) return 'Password is required';
    if (userType === 'pharmacist' && !formData.pharmacyName.trim()) return 'Pharmacy name is required';
    if (userType === 'pharmacist' && !formData.licenseNumber.trim()) return 'License number is required';
    if (!geoLocation?.latitude || !geoLocation?.longitude) return 'Please share your current location';
    return null;
  };

  const fetchCurrentLocation = async () => {
    if (locationLoading) return;

    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser');
      return;
    }

    setLocationLoading(true);
    setError('');

    try {
      const coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 60000,
        });
      });

      const latitude = coords.coords.latitude;
      const longitude = coords.coords.longitude;
      setGeoLocation({ latitude, longitude });
      setSuccess('Location captured successfully. You can click "View Location" to preview on map.');
    } catch {
      setError('Unable to fetch location. Please allow location access and try again.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSendOtp = async (event) => {
    if (event) event.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const validationError = validateRegistration();
      if (validationError) throw new Error(validationError);

      const selectedChannel = hasPhone ? otpChannel : 'email';

      const response = await fetch(`${API_BASE_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          phone: hasPhone ? formData.phone : undefined,
          otpChannel: selectedChannel,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to send OTP');

      setOtpTarget(selectedChannel);
      setStep(2);
      setSuccess(selectedChannel === 'phone' ? 'OTP sent to your mobile number.' : 'OTP sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const validationError = validateRegistration();
      if (validationError) throw new Error(validationError);
      if (!/^\d{6}$/.test(formData.otp)) throw new Error('OTP must be 6 digits');

      const selectedChannel = hasPhone ? otpChannel : 'email';

      const payload = {
        otp: formData.otp,
        otpChannel: selectedChannel,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: hasPhone ? formData.phone : undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode,
        latitude: geoLocation?.latitude,
        longitude: geoLocation?.longitude,
        password: formData.password,
        userType,
        pharmacyName: userType === 'pharmacist' ? formData.pharmacyName.trim() : undefined,
        licenseNumber: userType === 'pharmacist' ? formData.licenseNumber.trim() : undefined,
      };

      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'OTP verification failed');

      persistAuthSession(data);

      setShowAuthModal(false);
      onLogin(data.user.userType);

      const initialView = getInitialAuthView(data.user.userType);
      navigate(`/app/${initialView}`);
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (hidePageShell && !showAuthModal) {
    return null;
  }

  return (
    <div className={hidePageShell ? '' : 'min-h-screen'}>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-blue-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-blue-600">
                    {authMode === 'login' ? 'Sign In' : step === 1 ? 'Register Account' : 'OTP Verification'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {authMode === 'login'
                      ? 'Login with email/phone and password'
                      : step === 1
                      ? 'Fill all required details and request OTP'
                      : `Enter the OTP sent via ${otpTarget === 'phone' ? 'mobile number' : 'email'}`}
                  </p>
                </div>
                <button type="button" onClick={closeModal} className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2 transition">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5" />
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5" />
                  {success}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setStep(1);
                    setError('');
                    setSuccess('');
                  }}
                  className={`py-2.5 rounded-xl border-2 font-semibold ${
                    authMode === 'register' ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-200 text-gray-700'
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className={`py-2.5 rounded-xl border-2 font-semibold ${
                    authMode === 'login' ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-200 text-gray-700'
                  }`}
                >
                  Login
                </button>
              </div>

              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType('customer')}
                        className={`py-3 rounded-xl border-2 font-semibold ${
                          userType === 'customer' ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-200 text-gray-700'
                        }`}
                      >
                        <Users className="inline h-4.5 w-4.5 mr-2" />
                        User
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('pharmacist')}
                        className={`py-3 rounded-xl border-2 font-semibold ${
                          userType === 'pharmacist' ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-200 text-gray-700'
                        }`}
                      >
                        <Building2 className="inline h-4.5 w-4.5 mr-2" />
                        Pharmacist
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2"><Mail className="inline h-4 w-4 mr-1" />Email or Phone</label>
                    <input
                      name="identifier"
                      value={loginData.identifier}
                      onChange={handleLoginInputChange}
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                      placeholder="Enter email or 10-digit phone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2"><Lock className="inline h-4 w-4 mr-1" />Password</label>
                    <input
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginInputChange}
                      type="password"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                      placeholder="Enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Activity className="h-4.5 w-4.5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Login
                        <LogIn className="h-4.5 w-4.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {authMode === 'register' && step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">I am a</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType('customer')}
                        className={`py-3 rounded-xl border-2 font-semibold ${
                          userType === 'customer' ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-200 text-gray-700'
                        }`}
                      >
                        <Users className="inline h-4.5 w-4.5 mr-2" />
                        Customer
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType('pharmacist')}
                        className={`py-3 rounded-xl border-2 font-semibold ${
                          userType === 'pharmacist' ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-200 text-gray-700'
                        }`}
                      >
                        <Building2 className="inline h-4.5 w-4.5 mr-2" />
                        Pharmacist
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2"><User className="inline h-4 w-4 mr-1" />Full Name</label>
                      <input name="name" value={formData.name} onChange={handleInputChange} type="text" required className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none" placeholder="Enter full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2"><Mail className="inline h-4 w-4 mr-1" />Email (required)</label>
                      <input name="email" value={formData.email} onChange={handleInputChange} type="email" required className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none" placeholder="your@email.com" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2"><Smartphone className="inline h-4 w-4 mr-1" />Phone (optional)</label>
                      <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" maxLength={10} className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none" placeholder="9876543210" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2"><Lock className="inline h-4 w-4 mr-1" />Password</label>
                      <input name="password" value={formData.password} onChange={handleInputChange} type="password" required className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none" placeholder="Create your password" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2"><MapPin className="inline h-4 w-4 mr-1" />Address</label>
                    <input name="address" value={formData.address} onChange={handleInputChange} type="text" required className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none" placeholder="House / Street / Area" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                      <input name="city" value={formData.city} onChange={handleInputChange} type="text" required className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none" placeholder="City" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                      <input name="state" value={formData.state} onChange={handleInputChange} type="text" required className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none" placeholder="State" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                      <input name="pincode" value={formData.pincode} onChange={handleInputChange} type="text" maxLength={6} required className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none" placeholder="6-digit" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Share Location (Required)</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Use this to verify your current location while registering.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={fetchCurrentLocation}
                          disabled={locationLoading}
                          className="px-4 py-2 rounded-lg border border-blue-300 text-blue-700 font-semibold hover:bg-blue-100 disabled:opacity-60"
                        >
                          {locationLoading ? 'Fetching...' : 'Share My Location'}
                        </button>
                        <button
                          type="button"
                          disabled={!geoLocation}
                          onClick={() => setShowLocationModal(true)}
                          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                          View Location
                        </button>
                      </div>
                    </div>
                    {geoLocation && (
                      <p className="text-xs text-green-700 mt-3">
                        Location set: {geoLocation.latitude.toFixed(6)}, {geoLocation.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>

                  {userType === 'pharmacist' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2"><Building2 className="inline h-4 w-4 mr-1" />Pharmacy Name (required)</label>
                        <input name="pharmacyName" value={formData.pharmacyName} onChange={handleInputChange} type="text" required className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none" placeholder="Enter pharmacy name" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">License Number (required)</label>
                        <input name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} type="text" required className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none" placeholder="Enter license number" />
                      </div>
                    </div>
                  )}

                  {hasPhone ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Send OTP via</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setOtpChannel('email')}
                          className={`py-3 rounded-xl border-2 font-semibold ${otpChannel === 'email' ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-200 text-gray-700'}`}
                        >
                          <Mail className="inline h-4.5 w-4.5 mr-2" />Email
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtpChannel('phone')}
                          className={`py-3 rounded-xl border-2 font-semibold ${otpChannel === 'phone' ? 'bg-blue-600 border-blue-600 text-white' : 'border-blue-200 text-gray-700'}`}
                        >
                          <Smartphone className="inline h-4.5 w-4.5 mr-2" />Mobile
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                      Phone number is optional. OTP will be sent to your email.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Activity className="h-4.5 w-4.5 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="h-4.5 w-4.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {authMode === 'register' && step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-700 text-sm flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-green-500" />
                    OTP destination: {otpTarget === 'phone' ? formData.phone : formData.email}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Enter OTP</label>
                    <input
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      type="text"
                      maxLength={6}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none text-center text-2xl tracking-[0.35em] font-semibold"
                      placeholder="------"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Activity className="h-4.5 w-4.5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Create Account
                        <ArrowRight className="h-4.5 w-4.5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSendOtp()}
                    className="w-full text-blue-600 text-sm font-semibold hover:text-blue-700"
                  >
                    Didn’t receive OTP? Resend
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full text-gray-600 text-sm font-semibold hover:text-gray-700"
                  >
                    Edit registration details
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showLocationModal && geoLocation && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-900">Current Location Preview</h4>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="bg-gray-100 hover:bg-gray-200 rounded-lg p-2"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            <div className="p-4">
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  title="Location Map"
                  src={buildMapEmbedUrl(geoLocation.latitude, geoLocation.longitude)}
                  className="w-full h-[420px]"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-gray-700">
                  Latitude: {geoLocation.latitude.toFixed(6)} | Longitude: {geoLocation.longitude.toFixed(6)}
                </div>
                <a
                  href={buildGoogleMapsUrl(geoLocation.latitude, geoLocation.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
