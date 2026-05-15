// frontend/src/components/Alert.jsx

import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Alert Component
const Alert = ({ type, title, description, action }) => {
  const styles = {
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`${styles[type]} border-l-4 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 mr-3 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm mt-1 opacity-90">{description}</p>
          {action && (
            <button className="mt-3 text-sm font-medium underline hover:no-underline">
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;