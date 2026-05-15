// frontend/src/pages/Dashboard.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { DollarSign, Package, AlertTriangle, FileText, TrendingUp, Bell, RefreshCw } from 'lucide-react';
import StatsCard from '../components/StatsCard.jsx';
import Alert from '../components/Alert.jsx';
import { API_BASE_URL } from '../services/api';

const Dashboard = ({ medicines = [], prescriptions = [], sales = [] }) => {
  // --- Local state for bill stats and revenue ---
  const [billStats, setBillStats] = useState({
    summary: {
      totalBills: 0,
      totalRevenue: '0.00',
      avgBillAmount: '0.00',
      paymentMethods: { cash: 0, upi: 0 }
    },
    dailyStats: []
  });

  // --- Local state for alerts ---
  const [alerts, setAlerts] = useState({
    lowStock: [],
    expiringSoon: [],
    expired: []
  });
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [alertsError, setAlertsError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // --- Auth token ---
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // --- Fetch bill stats from backend ---
  const fetchBillStats = useCallback(async () => {
    if (!token) return;

    setLoadingStats(true);
    setStatsError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bills/stats/summary?days=7`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch bill stats (${res.status})`);
      }

      const data = await res.json();
      setBillStats(data.data || {});
    } catch (error) {
      console.error('Error fetching bill stats:', error);
      setStatsError(error.message);
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  // --- Fetch alerts from backend ---
  const fetchAlerts = useCallback(async () => {
    if (!token) {
      setAlertsError('No auth token found');
      return;
    }

    setLoadingAlerts(true);
    setAlertsError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to fetch alerts (${res.status})`);
      }

      const data = await res.json();

      // Ensure arrays exist
      setAlerts({
        lowStock: Array.isArray(data.lowStock) ? data.lowStock : [],
        expiringSoon: Array.isArray(data.expiringSoon) ? data.expiringSoon : [],
        expired: Array.isArray(data.expired) ? data.expired : [],
      });
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlertsError(error.message || 'Unable to load alerts');
    } finally {
      setLoadingAlerts(false);
    }
  }, [token]);

  // --- Fetch both stats and alerts on mount ---
  useEffect(() => {
    fetchBillStats();
    fetchAlerts();
  }, [fetchBillStats, fetchAlerts]);

  // --- Auto-refresh every 5 minutes ---
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBillStats();
      fetchAlerts();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchBillStats, fetchAlerts]);

  const lowStockCount = alerts.lowStock.length;
  const expiringCount = alerts.expiringSoon.length;
  const expiredCount = alerts.expired.length;
  const pendingRx = Array.isArray(prescriptions) 
    ? prescriptions.filter(p => p.status === 'pending').length 
    : 0;

  // Get today's revenue (local/UTC match) with fallback to latest available day
  const todayLocalKey = new Date().toLocaleDateString('en-CA');
  const todayUtcKey = new Date().toISOString().split('T')[0];
  const statsList = Array.isArray(billStats.dailyStats) ? billStats.dailyStats : [];
  const todayStat = statsList.find((day) => day.date === todayLocalKey || day.date === todayUtcKey);
  const latestStat = statsList.length > 0 ? statsList[statsList.length - 1] : null;
  const displayedRevenueStat = todayStat || latestStat;
  const todayRevenue = Number(displayedRevenueStat?.revenue || 0);
  const todayOrders = Number(displayedRevenueStat?.orders || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={() => {
              fetchBillStats();
              fetchAlerts();
            }}
            disabled={loadingAlerts || loadingStats}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw className={`h-4 w-4 ${(loadingAlerts || loadingStats) ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={DollarSign} 
          title="Today's Revenue" 
          value={`₹${Number(todayRevenue).toLocaleString()}`}
          subtitle={todayStat ? `${todayOrders} orders` : `${todayOrders} orders (latest day)`}
          color="#10B981"
        />
        <StatsCard 
          icon={Package} 
          title="Low Stock Items" 
          value={lowStockCount}
          subtitle="Needs reorder"
          color="#F59E0B"
        />
        <StatsCard 
          icon={AlertTriangle}
          title="Expired Medicines"
          value={expiredCount}
          subtitle="Remove immediately"
          color="#DC2626"
        />
        <StatsCard 
          icon={FileText} 
          title="Total Bills (7 Days)" 
          value={billStats.summary?.totalBills || 0}
          subtitle={`₹${Number(billStats.summary?.totalRevenue || 0).toLocaleString()}`}
          color="#8B5CF6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
            7-Day Revenue Trend
          </h3>
          <div className="space-y-3">
            {loadingStats ? (
              <div className="text-center py-8 text-gray-500">Loading sales data...</div>
            ) : billStats.dailyStats && billStats.dailyStats.length > 0 ? (
              billStats.dailyStats.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <div className="flex items-center space-x-3 flex-1 ml-4">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (day.revenue / (Math.max(...billStats.dailyStats.map(d => d.revenue)) || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-24 text-right">
                      ₹{Number(day.revenue).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">No sales data available</div>
            )}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Bell className="mr-2 h-5 w-5 text-orange-600" />
            Alerts & Notifications
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {loadingAlerts ? (
              <div className="text-sm text-gray-500 text-center py-4">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                Loading alerts...
              </div>
            ) : alertsError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">Error loading alerts</p>
                <p className="text-sm">{alertsError}</p>
              </div>
            ) : (
              <>
                {/* EXPIRED MEDICINES - Highest Priority */}
                {expiredCount > 0 && (
                  <div className="space-y-2">
                    <Alert 
                      type="danger"
                      title={`⚠️ ${expiredCount} Medicines Expired`}
                      description="Remove expired medicines from inventory immediately"
                      action="View Details"
                    />
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                      {alerts.expired.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-semibold text-red-900">{item.name}</span>
                            <span className="text-red-700 ml-2">({item.batch})</span>
                          </div>
                          <span className="text-xs text-red-600">
                            Expired: {new Date(item.expiry).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {alerts.expired.length > 3 && (
                        <div className="text-xs text-red-600 font-semibold pt-2 border-t border-red-200">
                          + {alerts.expired.length - 3} more expired items
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* LOW STOCK ITEMS */}
                {lowStockCount > 0 && (
                  <div className="space-y-2">
                    <Alert 
                      type="warning"
                      title={`📦 ${lowStockCount} Items Low on Stock`}
                      description="These items need to be reordered soon"
                      action="Reorder Now"
                    />
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                      {alerts.lowStock.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-semibold text-yellow-900">{item.name}</span>
                            <span className="text-yellow-700 ml-2">({item.batch})</span>
                          </div>
                          <span className="text-xs text-yellow-700 font-medium">
                            Stock: {item.stock} / Min: {item.reorderLevel}
                          </span>
                        </div>
                      ))}
                      {alerts.lowStock.length > 3 && (
                        <div className="text-xs text-yellow-700 font-semibold pt-2 border-t border-yellow-200">
                          + {alerts.lowStock.length - 3} more low stock items
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* EXPIRING SOON */}
                {expiringCount > 0 && (
                  <div className="space-y-2">
                    <Alert 
                      type="info"
                      title={`⏰ ${expiringCount} Medicines Expiring Soon`}
                      description="Medicines expiring within 30 days"
                      action="Review Now"
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                      {alerts.expiringSoon.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-semibold text-blue-900">{item.name}</span>
                            <span className="text-blue-700 ml-2">({item.batch})</span>
                          </div>
                          <span className="text-xs text-blue-700 font-medium">
                            {item.daysLeft} days left
                          </span>
                        </div>
                      ))}
                      {alerts.expiringSoon.length > 3 && (
                        <div className="text-xs text-blue-700 font-semibold pt-2 border-t border-blue-200">
                          + {alerts.expiringSoon.length - 3} more expiring items
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ALL GOOD */}
                {expiredCount === 0 && lowStockCount === 0 && expiringCount === 0 && (
                  <Alert 
                    type="success"
                    title="✅ All Good!"
                    description="Your inventory is healthy. No alerts right now."
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;