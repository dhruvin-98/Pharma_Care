// frontend/src/components/StatsCard.jsx

import React from 'react';
import { TrendingUp } from 'lucide-react';

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold mt-2" style={{ color }}>{value}</h3>
        {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        {trend && (
          <div className="flex items-center mt-2 space-x-1">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500 text-sm font-medium">{trend}</span>
          </div>
        )}
      </div>
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-full p-4">
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
    </div>
  </div>
);

export default StatsCard;