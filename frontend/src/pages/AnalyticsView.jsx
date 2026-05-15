// frontend/src/pages/AnalyticsView.jsx
// Analytics & Reports - Real data from database with day-wise analysis

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, Download, RefreshCw, Calendar } from 'lucide-react';
import StatsCard from '../components/StatsCard.jsx';
import { API_BASE_URL } from '../services/api';

const AnalyticsView = () => {
  const [billStats, setBillStats] = useState({
    summary: {
      totalBills: 0,
      totalRevenue: '0.00',
      avgBillAmount: '0.00',
      paymentMethods: { cash: 0, upi: 0 }
    },
    dailyStats: [],
    dateRange: { from: '', to: '' }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);
  const [inventoryItems, setInventoryItems] = useState([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Fetch analytics data from backend
  const fetchAnalytics = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const res = await fetch(`${API_BASE_URL}/api/bills/stats/summary?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch analytics data');

      const data = await res.json();
      setBillStats(data.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [token, days]);

  const fetchInventory = useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory?page=1&limit=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch inventory data');

      const data = await res.json();
      setInventoryItems(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const { summary, dailyStats } = billStats;

  // Calculate additional metrics
  const totalInventoryValue = Array.isArray(inventoryItems)
    ? inventoryItems.reduce((sum, item) => {
      const quantity = Number(item.quantity ?? item.stock ?? 0);
      const price = Number(item.pricePerPacket ?? item.price ?? 0);
      return sum + (Number.isFinite(quantity) ? quantity : 0) * (Number.isFinite(price) ? price : 0);
    }, 0)
    : 0;

  const avgDailyRevenue = dailyStats && dailyStats.length > 0
    ? (parseFloat(summary.totalRevenue) / dailyStats.length).toFixed(2)
    : '0.00';

  // Find best performing day
  const bestDay = dailyStats && dailyStats.length > 0
    ? dailyStats.reduce((best, current) => current.revenue > best.revenue ? current : best)
    : null;

  // Calculate growth percentage
  const growthPercentage = dailyStats && dailyStats.length > 1
    ? (((dailyStats[dailyStats.length - 1].revenue - dailyStats[0].revenue) / (dailyStats[0].revenue || 1)) * 100).toFixed(1)
    : '0.0';

  const chartPoints = useMemo(() => {
    if (!Array.isArray(dailyStats) || dailyStats.length === 0) return '';

    const width = 860;
    const height = 280;
    const padding = 32;
    const revenues = dailyStats.map((day) => Number(day.revenue || 0));
    const maxRevenue = Math.max(...revenues, 1);

    return dailyStats.map((day, index) => {
      const x = padding + (index * (width - 2 * padding)) / Math.max(dailyStats.length - 1, 1);
      const y = height - padding - ((Number(day.revenue || 0) / maxRevenue) * (height - 2 * padding));
      return `${x},${y}`;
    }).join(' ');
  }, [dailyStats]);

  const handleDownloadReport = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const generateCSV = () => {
    let csv = 'Date,Revenue,Orders\n';
    dailyStats.forEach(day => {
      csv += `${day.date},₹${day.revenue},${day.orders}\n`;
    });
    return csv;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Analytics & Reports</h2>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600" />
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={loading || !dailyStats || dailyStats.length === 0}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={DollarSign}
          title="Total Revenue"
          value={`₹${Number(summary.totalRevenue).toLocaleString()}`}
          subtitle={`${days}-day period`}
          color="#10B981"
        />
        <StatsCard 
          icon={ShoppingCart}
          title="Total Orders"
          value={summary.totalBills || 0}
          subtitle="Completed bills"
          color="#8B5CF6"
        />
        <StatsCard 
          icon={Package}
          title="Inventory Value"
          value={`₹${Number(totalInventoryValue).toLocaleString()}`}
          subtitle={`${inventoryItems?.length || 0} products`}
          color="#F59E0B"
        />
        <StatsCard 
          icon={TrendingUp}
          title="Avg Order Value"
          value={`₹${Number(summary.avgBillAmount).toLocaleString()}`}
          subtitle={growthPercentage + '% vs first day'}
          color="#EF4444"
        />
      </div>

      {/* Charts and Analysis */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading analytics data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Selling Medicines */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                Most Selling Medicines
              </h3>
              <div className="space-y-4">
                {Array.isArray(billStats.topSellingMedicines) && billStats.topSellingMedicines.length > 0 ? (
                  billStats.topSellingMedicines.map((medicine, index) => (
                    <div key={medicine.medicineId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">{medicine.medicineName}</div>
                        <div className="text-xs text-gray-500">Rank #{index + 1}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-700">{Number(medicine.quantitySold || 0)} sold</div>
                        <div className="text-xs text-gray-600">₹{Number(medicine.revenue || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No medicine sales data available</p>
                )}
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Payment Methods</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Cash Payments</span>
                    <span className="text-lg font-bold text-gray-900">{summary.paymentMethods?.cash || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{
                        width: `${summary.totalBills ? (((summary.paymentMethods?.cash || 0) / summary.totalBills) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {summary.totalBills ? (((summary.paymentMethods?.cash || 0) / summary.totalBills) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">UPI Payments</span>
                    <span className="text-lg font-bold text-gray-900">{summary.paymentMethods?.upi || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{
                        width: `${summary.totalBills ? (((summary.paymentMethods?.upi || 0) / summary.totalBills) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {summary.totalBills ? (((summary.paymentMethods?.upi || 0) / summary.totalBills) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Average Transaction Value: <span className="font-bold">₹{Number(summary.avgBillAmount).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Best Performing Day</h3>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {bestDay ? `₹${Number(bestDay.revenue).toLocaleString()}` : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">
                {bestDay ? new Date(bestDay.date + 'T00:00:00').toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'No data'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Average Daily Revenue</h3>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                ₹{Number(avgDailyRevenue).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Over {days} days</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Growth Trend</h3>
              <div className={`text-3xl font-bold mb-1 ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthPercentage}%
              </div>
              <p className="text-sm text-gray-600">
                {growthPercentage >= 0 ? 'Increasing' : 'Decreasing'} trend
              </p>
            </div>
          </div>

          {/* Daily Report Summary Graph */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Daily Report Summary (Line Graph)</h3>
            </div>
            <div className="p-6">
              {dailyStats && dailyStats.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <svg viewBox="0 0 860 280" className="w-full min-w-[700px] h-72">
                      <rect x="0" y="0" width="860" height="280" fill="#ffffff" />
                      {[1, 2, 3, 4].map((line) => (
                        <line
                          key={line}
                          x1="32"
                          y1={32 + line * 48}
                          x2="828"
                          y2={32 + line * 48}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      ))}
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="3"
                        points={chartPoints}
                      />
                      {dailyStats.map((day, index) => {
                        const width = 860;
                        const height = 280;
                        const padding = 32;
                        const maxRevenue = Math.max(...dailyStats.map((entry) => Number(entry.revenue || 0)), 1);
                        const x = padding + (index * (width - 2 * padding)) / Math.max(dailyStats.length - 1, 1);
                        const y = height - padding - ((Number(day.revenue || 0) / maxRevenue) * (height - 2 * padding));

                        return (
                          <g key={`${day.date}-${index}`}>
                            <circle cx={x} cy={y} r="4" fill="#1d4ed8" />
                            <text x={x} y={264} textAnchor="middle" fontSize="11" fill="#6b7280">
                              {new Date(day.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-600">Selected Range:</span>
                      <div className="font-semibold text-gray-900">Last {days} days</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-600">Total Revenue:</span>
                      <div className="font-semibold text-gray-900">₹{Number(summary.totalRevenue || 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-600">Total Orders:</span>
                      <div className="font-semibold text-gray-900">{Number(summary.totalBills || 0)}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">No data available for selected days</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsView;