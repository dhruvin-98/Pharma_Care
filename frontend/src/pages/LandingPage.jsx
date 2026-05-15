import React, { useState } from 'react';
import { 
  Pill, ShoppingCart, FileText, Zap, Shield, Clock,
  ChevronRight, Star, Users, Award, Truck
} from 'lucide-react';
import AuthPage from './AuthPage.jsx';

const LandingPage = ({ onLogin, onLogout }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('customer');
  const [selectedMode, setSelectedMode] = useState('register');

  const openAuthModal = ({ role = 'customer', mode = 'register' } = {}) => {
    setSelectedRole(role);
    setSelectedMode(mode);
    setShowAuthModal(true);
  };

  const features = [
    {
      icon: Pill,
      title: 'Easy Medicine Search',
      description: 'Find medicines quickly with our advanced search and filter options'
    },
    {
      icon: FileText,
      title: 'Prescription Upload',
      description: 'Upload your prescriptions digitally and get medicines delivered safely'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Get your medicines delivered at your doorstep within 24 hours'
    },
    {
      icon: Shield,
      title: 'Verified Pharmacies',
      description: 'Buy from verified and licensed pharmacies near you'
    },
    {
      icon: Clock,
      title: 'Available 24/7',
      description: 'Order medicines anytime, anywhere with our 24/7 service'
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'All medicines are genuine and certified by health authorities'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '50K+' },
    { label: 'Medicines Available', value: '10K+' },
    { label: 'Verified Pharmacies', value: '500+' },
    { label: 'Daily Orders', value: '5K+' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Pill className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">PharmaCare</span>
          </div>
          <button
            onClick={() => openAuthModal({ mode: 'login' })}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Get Your Medicines <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Delivered Fast</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              PharmaCare makes it easy to order prescription medicines online. Upload your prescription, choose from verified pharmacies, and get medicines delivered to your door.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => openAuthModal({ role: 'customer', mode: 'register' })}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
              >
                <span>Get Started Now</span>
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => openAuthModal({ role: 'pharmacist', mode: 'register' })}
                className="bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg font-bold text-lg transition-all"
              >
                Register as Pharmacist
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-10 flex items-center space-x-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600 font-semibold">4.8/5 – Trusted by thousands</span>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <Pill className="h-8 w-8 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Upload Prescription</p>
                    <p className="text-sm text-gray-600">Digital prescription upload</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
                  <ShoppingCart className="h-8 w-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Find Medicines</p>
                    <p className="text-sm text-gray-600">Search & compare prices</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                  <Truck className="h-8 w-8 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Fast Delivery</p>
                    <p className="text-sm text-gray-600">Same day delivery available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</p>
                <p className="text-gray-600 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose PharmaCare?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide a seamless experience for ordering medicines online with verified pharmacies and fast delivery
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl p-8 transition-all transform hover:-translate-y-2"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* User Types Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            For Customers & Pharmacists
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customers */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Customers</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3 text-gray-700">
                  <ChevronRight className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Upload prescriptions digitally</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-700">
                  <ChevronRight className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Search medicines and compare prices</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-700">
                  <ChevronRight className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Get medicines delivered safely</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-700">
                  <ChevronRight className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span>Track your orders in real-time</span>
                </li>
              </ul>
              <button
                onClick={() => openAuthModal({ role: 'customer', mode: 'register' })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Sign Up as Customer
              </button>
            </div>

            {/* Pharmacists */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <Award className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Pharmacists</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3 text-gray-700">
                  <ChevronRight className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span>Manage your pharmacy inventory</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-700">
                  <ChevronRight className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span>Process prescriptions online</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-700">
                  <ChevronRight className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span>Analyze sales and trends</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-700">
                  <ChevronRight className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  <span>Reach more customers online</span>
                </li>
              </ul>
              <button
                onClick={() => openAuthModal({ role: 'pharmacist', mode: 'register' })}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Sign Up as Pharmacist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of customers and pharmacists using PharmaCare
          </p>
          <button
            onClick={() => openAuthModal({ role: 'customer', mode: 'register' })}
            className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-4 px-10 rounded-lg transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            Register Now – It's Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Pill className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold text-white">PharmaCare</span>
              </div>
              <p className="text-sm">Your trusted partner for online medicine delivery</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-all">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-all">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-all">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-all">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-all">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-all">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>Email: support@pharmacare.com</li>
                <li>Phone: +91 1234567890</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 PharmaCare. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {showAuthModal && (
        <AuthPage
          onLogin={onLogin}
          onLogout={onLogout}
          hidePageShell
          initialRole={selectedRole}
          initialMode={selectedMode}
          onModalClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default LandingPage;
