// frontend/src/components/Settings.jsx

import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Bell, Lock, User, Shield, Globe,
  Mail, Smartphone, Eye, EyeOff, Save, ChevronRight,
  Trash2, Download, Upload, CheckCircle, Key, AlertCircle
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [settings, setSettings] = useState({
    // General Settings
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    prescriptionAlerts: true,
    promotionalEmails: false,
    
    // Privacy
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    dataSharing: false,
    
    // Security
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
    
    // Appearance
    theme: 'light',
    compactView: false,
    animations: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
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
              <CheckCircle className="h-5 w-5" />
              <span className="font-semibold">{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-2 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-semibold">{tab.label}</span>
                  <ChevronRight className={`h-4 w-4 ml-auto ${activeTab === tab.id ? '' : 'text-gray-400'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">General Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      >
                        <option value="UTC">UTC</option>
                        <option value="EST">Eastern Time</option>
                        <option value="PST">Pacific Time</option>
                        <option value="CST">Central Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        value={settings.dateFormat}
                        onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <SettingToggle
                      icon={Mail}
                      label="Email Notifications"
                      description="Receive notifications via email"
                      checked={settings.emailNotifications}
                      onChange={(val) => handleSettingChange('emailNotifications', val)}
                    />
                    
                    <SettingToggle
                      icon={Bell}
                      label="Push Notifications"
                      description="Receive push notifications on your device"
                      checked={settings.pushNotifications}
                      onChange={(val) => handleSettingChange('pushNotifications', val)}
                    />
                    
                    <SettingToggle
                      icon={Smartphone}
                      label="SMS Notifications"
                      description="Receive text messages for important updates"
                      checked={settings.smsNotifications}
                      onChange={(val) => handleSettingChange('smsNotifications', val)}
                    />

                    <hr className="my-6" />

                    <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Types</h3>

                    <SettingToggle
                      icon={CheckCircle}
                      label="Order Updates"
                      description="Get notified about order status changes"
                      checked={settings.orderUpdates}
                      onChange={(val) => handleSettingChange('orderUpdates', val)}
                    />

                    <SettingToggle
                      icon={AlertCircle}
                      label="Prescription Alerts"
                      description="Reminders for prescription refills"
                      checked={settings.prescriptionAlerts}
                      onChange={(val) => handleSettingChange('prescriptionAlerts', val)}
                    />

                    <SettingToggle
                      icon={Mail}
                      label="Promotional Emails"
                      description="Receive special offers and promotions"
                      checked={settings.promotionalEmails}
                      onChange={(val) => handleSettingChange('promotionalEmails', val)}
                    />
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={settings.profileVisibility}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                        <option value="contacts">Contacts Only</option>
                      </select>
                    </div>

                    <SettingToggle
                      icon={Mail}
                      label="Show Email Address"
                      description="Make your email visible on your profile"
                      checked={settings.showEmail}
                      onChange={(val) => handleSettingChange('showEmail', val)}
                    />

                    <SettingToggle
                      icon={Smartphone}
                      label="Show Phone Number"
                      description="Make your phone number visible on your profile"
                      checked={settings.showPhone}
                      onChange={(val) => handleSettingChange('showPhone', val)}
                    />

                    <SettingToggle
                      icon={Globe}
                      label="Data Sharing"
                      description="Share anonymized data for service improvement"
                      checked={settings.dataSharing}
                      onChange={(val) => handleSettingChange('dataSharing', val)}
                    />

                    <hr className="my-6" />

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-6 w-6 text-blue-600 mt-1" />
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Your Data is Protected</h4>
                          <p className="text-sm text-gray-700">
                            We take your privacy seriously. Your personal information is encrypted and never shared with third parties without your consent.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-4">
                    <SettingToggle
                      icon={Key}
                      label="Two-Factor Authentication"
                      description="Add an extra layer of security to your account"
                      checked={settings.twoFactorAuth}
                      onChange={(val) => handleSettingChange('twoFactorAuth', val)}
                    />

                    <SettingToggle
                      icon={Bell}
                      label="Login Alerts"
                      description="Get notified when someone logs into your account"
                      checked={settings.loginAlerts}
                      onChange={(val) => handleSettingChange('loginAlerts', val)}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <select
                        value={settings.sessionTimeout}
                        onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>

                    <hr className="my-6" />

                    <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Appearance</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Theme
                      </label>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700">Light (default)</p>
                        <p className="text-xs text-gray-500 mt-1">Theme selection is fixed to Light.</p>
                      </div>
                    </div>

                    <SettingToggle
                      icon={Eye}
                      label="Compact View"
                      description="Show more content in less space"
                      checked={settings.compactView}
                      onChange={(val) => handleSettingChange('compactView', val)}
                    />

                    <SettingToggle
                      icon={Download}
                      label="Enable Animations"
                      description="Show smooth transitions and animations"
                      checked={settings.animations}
                      onChange={(val) => handleSettingChange('animations', val)}
                    />
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toggle Component
const SettingToggle = ({ icon: Icon, label, description, checked, onChange }) => {
  return (
    <div className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
      <div className="flex items-start space-x-3 flex-1">
        <div className="bg-blue-100 p-2 rounded-lg mt-1">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{label}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0 ml-4 ${
          checked ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
            checked ? 'transform translate-x-7' : ''
          }`}
        />
      </button>
    </div>
  );
};

export default Settings;