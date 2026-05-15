// frontend/src/utils.js

/**
 * Determines the stock status based on current stock and reorder level.
 * @param {number} stock - Current quantity in stock.
 * @param {number} reorderLevel - The minimum stock level to trigger a reorder.
 * @returns {{label: string, color: string}} Status label and Tailwind CSS color class.
 */
export const getStockStatus = (stock, reorderLevel) => {
  stock = parseInt(stock);
  reorderLevel = parseInt(reorderLevel);

  if (stock === 0) {
    return { label: 'Out of Stock', color: 'bg-gray-500' };
  } else if (stock <= reorderLevel) {
    return { label: 'Low Stock', color: 'bg-red-500' };
  } else if (stock <= reorderLevel * 2) {
    return { label: 'Reorder Soon', color: 'bg-yellow-500' };
  } else {
    return { label: 'In Stock', color: 'bg-green-500' };
  }
};

export const getAuthUser = () => {
  const data = localStorage.getItem('user_auth');
  return data ? JSON.parse(data) : null;
};

/**
 * Calculates the number of days until a given expiry date.
 * @param {string} expiryDateString - Expiry date in 'YYYY-MM-DD' format.
 * @returns {number} The number of days until expiry. Negative if expired.
 */
export const getDaysUntilExpiry = (expiryDateString) => {
  if (!expiryDateString) return Infinity; // Or a very large number

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize 'today' to start of day

  const expiryDate = new Date(expiryDateString);
  expiryDate.setHours(0, 0, 0, 0); // Normalize expiry date

  const diffTime = expiryDate.getTime() - today.getTime();
  // Convert milliseconds to days
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};