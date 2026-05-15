// frontend/src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, FileText, TrendingUp, 
  Search, Upload, ShoppingCart, LogOut, Menu, X,
  Pill, User, Settings, Bell, ChevronDown,
  HelpCircle, Mail, Check, Clock, Package2, AlertCircle, Receipt
} from 'lucide-react';

const Navbar = ({ 
  activeView, 
  setActiveView, 
  userRole, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen,
  handleLogout 
}) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState(null);

  
  const [notifications] = useState([
    { 
      id: 1, 
      type: 'prescription',
      title: 'New Prescription', 
      message: 'Prescription #12345 uploaded',
      time: '5 min ago', 
      read: false,
      icon: FileText,
      color: 'blue'
    },
    { 
      id: 2, 
      type: 'order',
      title: 'Order Delivered', 
      message: 'Order #98765 has been delivered',
      time: '1 hour ago', 
      read: false,
      icon: Package2,
      color: 'green'
    },
    { 
      id: 3, 
      type: 'alert',
      title: 'Stock Alert', 
      message: 'Aspirin running low - 5 units left',
      time: '2 hours ago', 
      read: true,
      icon: AlertCircle,
      color: 'orange'
    },
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-dropdown') && !event.target.closest('.profile-button')) {
        setShowProfileMenu(false);
      }
      if (!event.target.closest('.notification-dropdown') && !event.target.closest('.notification-button')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNavigationItems = () => {
    if (userRole === 'admin' || userRole === 'pharmacist') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'billing', label: 'Create Bill', icon: Receipt },
        { id: 'bills', label: 'Bills', icon: FileText },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        // { id: 'find-medicine', label: 'Find Medicine', icon: Search },
        // { id: 'upload-rx', label: 'Upload Rx', icon: Upload }
      ];
    } else if (userRole === 'customer') {
      return [
        { id: 'find-medicine', label: 'Find Medicine', icon: Search },
        { id: 'upload-rx', label: 'Upload Prescription', icon: Upload },
        { id: 'my-orders', label: 'My Orders', icon: ShoppingCart }
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  const getRoleDisplayName = () => {
    if (userRole === 'admin') return 'Admin';
    if (userRole === 'pharmacist') return 'Pharmacist';
    if (userRole === 'customer') return 'Customer';
    return 'User';
  };

  const getRoleIcon = () => {
    if (userRole === 'admin') return '👨‍💼';
    if (userRole === 'pharmacist') return '💊';
    return '🛒';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleProfileClick = () => {
    navigate('/app/profile');
    setShowProfileMenu(false);
    setIsMobileMenuOpen(false);
  };


  useEffect(() => {
  const fetchProfile = async () => {
    const auth = JSON.parse(localStorage.getItem('user_auth'));
    if (!auth?.token) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      });

      const data = await res.json();
      localStorage.setItem('user_profile', JSON.stringify(data));
      setUser(data); // new state hook
    } catch (err) {
      console.log("Profile fetch failed:", err);
    }
  };

  fetchProfile();
}, []);


  return (
    <nav className={`bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'py-2 shadow-xl backdrop-blur-md bg-opacity-95' : 'py-0'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-white rounded-2xl p-2.5 shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Pill className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center space-x-2">
                <span>PharmaCare</span>
                {/* <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">Pro</span> */}
              </h1>
              <p className="text-xs text-blue-100 font-medium flex items-center space-x-1">
                {/* <span>{getRoleIcon()}</span> */}
                <span>{getRoleDisplayName()} Portal</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-300 transform ${
                  activeView === item.id
                    ? 'bg-white text-blue-600 shadow-lg scale-105'
                    : 'hover:bg-white/10 hover:scale-105'
                }`}
              >
                <item.icon className={`h-4 w-4 transition-transform duration-300 ${
                  activeView === item.id ? 'scale-110' : ''
                }`} />
                <span className="text-sm font-semibold">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode toggle removed */}

            {/* Help Button */}
            {/* <button 
              className="hidden md:flex hover:bg-white/10 p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm"
              title="Help & Support"
            >
              <HelpCircle className="h-5 w-5" />
            </button> */}

            {/* Notifications */}
            <div className="relative notification-dropdown">
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="notification-button relative hover:bg-white/10 p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm"
              >
                <Bell className={`h-5 w-5 transition-transform duration-300 ${showNotifications ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center animate-pulse shadow-lg px-1.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Enhanced Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 origin-top-right animate-in border border-gray-200">
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg">Notifications</h3>
                      <p className="text-blue-100 text-xs">{unreadCount} unread messages</p>
                    </div>
                    <button className="text-white hover:bg-white/20 px-3 py-1 rounded-lg text-xs font-semibold transition">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notif => {
                      const IconComponent = notif.icon;
                      const colorClasses = {
                        blue: 'bg-blue-100 text-blue-600',
                        green: 'bg-green-100 text-green-600',
                        orange: 'bg-orange-100 text-orange-600'
                      };
                      
                      return (
                        <div 
                          key={notif.id}
                          className={`px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer group ${
                            !notif.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`${colorClasses[notif.color]} p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-gray-900">{notif.title}</p>
                                  <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                                </div>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0 ml-2"></div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 mt-2">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <p className="text-xs text-gray-500">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-6 py-4 bg-gray-50 text-center border-t border-gray-200">
                    <button className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition">
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Replace the profile dropdown section in Navbar.jsx (lines ~380-450) */}

              <div className="relative hidden md:block profile-dropdown">
                <button 
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="profile-button flex items-center space-x-2 hover:bg-white/10 px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </button>

                {/* Enhanced Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 origin-top-right animate-in border border-gray-200">
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-2 py-2">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white/30">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg">
                            {(user?.name) || "User"}
                          </p>
                          <p className="text-blue-100 text-sm font-medium">
                            {user?.email || getRoleDisplayName()}
                          </p>
                          {user?.userType === "pharmacist" && (
                            <p className="text-xs text-purple-200">{user.pharmacyName}</p>
                          )}
                          <div className="flex items-center space-x-1 mt-1">
                            <Check className="h-3 w-3 text-green-300" />
                            <span className="text-xs text-green-300">Verified Account</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <button 
                        onClick={() => {
                          navigate('/app/profile');
                          setShowProfileMenu(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50 rounded-xl transition-all flex items-center space-x-3 group"
                      >
                        <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold">My Profile</span>
                          <p className="text-xs text-gray-500">View and edit profile</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => {
                          navigate('/app/settings');
                          setShowProfileMenu(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-purple-50 rounded-xl transition-all flex items-center space-x-3 group mt-1"
                      >
                        <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition">
                          <Settings className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold">Settings</span>
                          <p className="text-xs text-gray-500">Preferences & privacy</p>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => {
                          navigate('/app/messages');
                          setShowProfileMenu(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left text-gray-700 hover:bg-green-50 rounded-xl transition-all flex items-center space-x-3 group mt-1"
                      >
                        <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition">
                          <Mail className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold">Messages</span>
                          <p className="text-xs text-gray-500">Chat with support</p>
                        </div>
                      </button>
                      
                      <hr className="my-1" />
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-1 text-left text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center space-x-3 group"
                      >
                        <div className="bg-red-100 p-2 rounded-lg group-hover:bg-red-200 transition">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold">Logout</span>
                          <p className="text-xs text-red-400">Sign out of account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden hover:bg-white/10 p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 backdrop-blur-sm border border-white/20" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-in border-t border-white/20 mt-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-300 transform ${
                  activeView === item.id
                    ? 'bg-white text-blue-600 shadow-lg scale-105'
                    : 'hover:bg-white/10'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
                {activeView === item.id && <Check className="h-4 w-4 ml-auto" />}
              </button>
            ))}
            
            {/* Mobile Profile Section */}
            <div className="pt-4 mt-4 border-t border-white/20 space-y-2">
              <div className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">John Doe</p>
                  <p className="text-xs text-blue-100">{getRoleDisplayName()}</p>
                </div>
              </div>
              <button 
                onClick={handleProfileClick}
                className="w-full px-4 py-3 text-left hover:bg-white/10 rounded-xl transition-all flex items-center space-x-3"
              >
                <User className="h-5 w-5" />
                <span className="font-medium">View Profile</span>
              </button>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left bg-red-500 hover:bg-red-600 rounded-xl transition-all flex items-center space-x-3 shadow-lg"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;