// frontend/src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate,useLocation  } from 'react-router-dom';
import { ShoppingCart, Users } from 'lucide-react';

// --- Imports for Authenticated Views ---
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx'; // Pharmacist/Admin default
import InventoryView from './pages/InventoryView.jsx';
import BillingView from './pages/BillingView.jsx';
import BillManagementView from './pages/BillManagementView.jsx';
import PrescriptionsView from './pages/PrescriptionsView.jsx';
import AnalyticsView from './pages/AnalyticsView.jsx';
import FindMedicineView from './pages/FindMedicineView.jsx'; // Customer default
import UploadPrescriptionView from './pages/UploadPrescriptionView.jsx';
import ProfileView from './components/ProfileView.jsx'; // <--- Keep this import

import Profile from './components/Profile.jsx';
import Settings from './components/Settings.jsx';
import Messages from './components/Messages.jsx';
// --- Auth and Utility Imports ---
import AuthPage from './pages/AuthPage.jsx'; 
import LandingPage from './pages/LandingPage.jsx';
import {
  mockMedicines,
  mockPrescriptions,
  mockSales,
  mockNearbyPharmacies
} from './mockData.js'; 



// Function to get the initial authenticated view based on the role
const getInitialAuthView = (role) => {
    if (role === 'admin' || role === 'pharmacist') {
        return 'dashboard';
    } else if (role === 'customer') {
        return 'find-medicine';
    }
    return 'dashboard'; 
}


// Update the renderView function in App.jsx (around line 20-70)
const renderView = (activeView, userRole) => {
  // Common views for all roles
  if (activeView === 'profile') {
    return <Profile />;
  }
  if (activeView === 'settings') {
    return <Settings />;
  }
  if (activeView === 'messages') {
    return <Messages />;
  }
  
  // Role-specific views
  if (userRole === 'admin' || userRole === 'pharmacist') {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard medicines={mockMedicines} prescriptions={mockPrescriptions} sales={mockSales} />;
      case 'inventory':
        return <InventoryView medicines={mockMedicines} />;
      case 'billing':
        return <BillingView />;
      case 'bills':
        return <BillManagementView />;
      case 'prescriptions':
        return <PrescriptionsView prescriptions={mockPrescriptions} />;
      case 'analytics':
        return <AnalyticsView sales={mockSales} medicines={mockMedicines} />;
      case 'find-medicine':
        return <FindMedicineView pharmacies={mockNearbyPharmacies} />;
      case 'upload-rx':
        return <UploadPrescriptionView />;
      default:
        return <Dashboard medicines={mockMedicines} prescriptions={mockPrescriptions} sales={mockSales} />;
    }
  } else if (userRole === 'customer') {
    switch (activeView) {
      case 'find-medicine':
        return <FindMedicineView pharmacies={mockNearbyPharmacies} />;
      case 'upload-rx':
        return <UploadPrescriptionView />;
      case 'my-orders':
        return (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Orders Yet</h3>
            <p className="text-gray-600">Upload a prescription to place your first order</p>
          </div>
        );
      default:
        return <FindMedicineView pharmacies={mockNearbyPharmacies} />;
    }
  }
  return <Navigate to="/" replace />;
};


// --- 1. Main Authenticated Application Layout Component (Protected) ---
// Update the AuthenticatedApp component to handle route-based navigation
const AuthenticatedApp = ({ userRole, handleLogout, activeView, setActiveView, theme, setTheme }) => { 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation(); // Import useLocation from react-router-dom

  // Update activeView based on URL path
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'app') {
      setActiveView(path);
    }
  }, [location, setActiveView]);
  
  const currentView = renderView(activeView, userRole);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'}`}> {/* <--- THEME CLASS APPLIED HERE */}
      <Navbar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        userRole={userRole}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        handleLogout={handleLogout}
        theme={theme} // <--- PASSING THEME STATE
        setTheme={setTheme} // <--- PASSING SET THEME FUNCTION
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView} {/* <--- RENDER THE CORRECT VIEW */}
      </main>

      {/* Role Switcher (For Demo) - REMAINS THE SAME */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            const newRole = userRole === 'admin' ? 'customer' : (userRole === 'customer' ? 'admin' : 'admin');
            const authData = { userType: newRole, token: 'mock_token', name: 'Test User' };
            localStorage.setItem('user_auth', JSON.stringify(authData));
            // Also update userInfo for the new user profile data read by ProfileView
            localStorage.setItem('userInfo', JSON.stringify({ name: 'Test User', userType: newRole, email: 'test@user.com' }));
            handleLogout(); 
            window.location.reload(); 
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 transition-all transform hover:scale-105"
        >
          <Users className="h-5 w-5" />
          <span className="font-semibold">
            Switch to {userRole === 'admin' ? 'Customer' : (userRole === 'customer' ? 'Pharmacist' : 'Admin')}
          </span>
        </button>
      </div>
    </div>
  );
};


// --- 2. Root Component for Routing and State Management ---
const App = () => {
  const [userRole, setUserRole] = useState(null); 
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  // THEME STATE INITIALIZATION
  const [theme, setTheme] = useState(() => {
    // Check localStorage for preferred theme, default to 'light'
    return localStorage.getItem('theme') || 'light';
  });

  // Apply theme class to document body on theme change
  useEffect(() => {
    document.documentElement.className = theme; // Apply 'light' or 'dark' class
    localStorage.setItem('theme', theme);
  }, [theme]);


  const handleLogin = (role) => {
    setUserRole(role);
    setActiveView(getInitialAuthView(role));
  };

  const handleLogout = () => {
      localStorage.removeItem('user_auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userInfo'); // <--- Clear user info too
      localStorage.removeItem('user_profile');
      setUserRole(null);
      setActiveView('dashboard'); 
      // Do NOT clear theme on logout, let user keep their theme preference
  }

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authData = localStorage.getItem('user_auth');
        if (authData) {
          const userData = JSON.parse(authData);
          handleLogin(userData.userType);
        }
      } catch (error) {
        console.log('No existing session found');
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  if (loading) { 
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Loading Session...</div>;
  }
  
  const authRedirectPath = userRole ? `/app/${getInitialAuthView(userRole)}` : '/';
  
  return (
    <Router>
      <Routes>
        {/* Route for landing page. */}
        <Route
          path="/"
          element={
            userRole ? <Navigate to={`/app/${getInitialAuthView(userRole)}`} replace /> : <LandingPage onLogin={handleLogin} onLogout={handleLogout} />
          }
        />
        {/* Pass setTheme/theme to AuthPage if you want to apply the theme there too. */}
        <Route 
          path="/AuthPage" 
          element={
            userRole 
              ? <Navigate to={`/app/${getInitialAuthView(userRole)}`} replace />
              : <AuthPage onLogin={handleLogin} onLogout={handleLogout} />
          } 
        />


        {/* Private Route: All authenticated views are nested under /app/* */}
        <Route
          path="/app/*"
          element={
            userRole ? (
              <AuthenticatedApp 
                userRole={userRole} 
                handleLogout={handleLogout}
                activeView={activeView}
                setActiveView={setActiveView}
                theme={theme} // <--- PASSING THEME
                setTheme={setTheme} // <--- PASSING SET THEME
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        
        {/* Fallback Route */}
        <Route
          path="*"
          element={
            userRole ? <Navigate to={authRedirectPath} replace /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;