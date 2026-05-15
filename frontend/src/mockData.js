// frontend/src/mockData.js

// ==================== MOCK DATA ====================
export const mockMedicines = [
  { id: 1, name: 'Paracetamol 500mg', category: 'Painkiller', stock: 150, reorderLevel: 50, price: 20, expiry: '2025-12-15', supplier: 'MedSupply Co', batch: 'BT001' },
  { id: 2, name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 30, reorderLevel: 40, price: 180, expiry: '2025-11-20', supplier: 'PharmaCare', batch: 'BT002' },
  { id: 3, name: 'Ibuprofen 400mg', category: 'Painkiller', stock: 200, reorderLevel: 60, price: 35, expiry: '2026-03-10', supplier: 'MedSupply Co', batch: 'BT003' },
  { id: 4, name: 'Cetirizine 10mg', category: 'Antihistamine', stock: 15, reorderLevel: 30, price: 45, expiry: '2025-11-05', supplier: 'HealthPlus', batch: 'BT004' },
  { id: 5, name: 'Vitamin D3 60k', category: 'Supplement', stock: 80, reorderLevel: 40, price: 150, expiry: '2026-01-30', supplier: 'PharmaCare', batch: 'BT005' },
];

export const mockPrescriptions = [
  { id: 1, patientName: 'Rajesh Kumar', uploadDate: '2025-10-29', status: 'pending', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400', medicines: ['Amoxicillin', 'Paracetamol'] },
  { id: 2, patientName: 'Priya Sharma', uploadDate: '2025-10-28', status: 'approved', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400', medicines: ['Cetirizine'] },
  { id: 3, patientName: 'Amit Patel', uploadDate: '2025-10-30', status: 'pending', image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400', medicines: ['Ibuprofen', 'Vitamin D3'] },
];

export const mockSales = [
  { date: '2025-10-24', revenue: 12500, orders: 45 },
  { date: '2025-10-25', revenue: 15200, orders: 52 },
  { date: '2025-10-26', revenue: 10800, orders: 38 },
  { date: '2025-10-27', revenue: 18900, orders: 61 },
  { date: '2025-10-28', revenue: 16700, orders: 55 },
  { date: '2025-10-29', revenue: 14300, orders: 48 },
  { date: '2025-10-30', revenue: 19500, orders: 67 },
  { date: '2025-10-31', revenue: 21000, orders: 72 },
];

export const mockNearbyPharmacies = [
  { id: 1, name: 'HealthCare Pharmacy', distance: '0.8 km', time: '5 min', rating: 4.5, open: true, phone: '+91 98765 43210', lat: 28.6139, lng: 77.2090 },
  { id: 2, name: 'MediPlus Store', distance: '1.2 km', time: '8 min', rating: 4.2, open: true, phone: '+91 98765 43211', lat: 28.6149, lng: 77.2100 },
  { id: 3, name: 'Apollo Pharmacy', distance: '2.1 km', time: '12 min', rating: 4.7, open: true, phone: '+91 98765 43212', lat: 28.6159, lng: 77.2110 },
  { id: 4, name: 'Wellness Chemist', distance: '2.8 km', time: '15 min', rating: 4.0, open: false, phone: '+91 98765 43213', lat: 28.6169, lng: 77.2120 },
];