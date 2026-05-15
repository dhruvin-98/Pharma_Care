require("dotenv").config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routers/authRoutes');
const inventoryRoutes = require('./routers/inventoryRoutes');
const billRoutes = require('./routers/billRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');


// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://pharma-care-pcc8.vercel.app',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const isAllowed =
            allowedOrigins.includes(origin) ||
            /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

        if (isAllowed) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'PharmaCare API is running',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/bills', billRoutes);

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'PharmaCare API is running' });
});

// Prescription Routes
app.use("/api/prescriptions", require("./routers/prescriptionRoutes"));
app.use("/uploads", express.static("uploads"));


const prescriptionRoutes = require("./routers/prescriptionRoutes");
app.use("/api/prescriptions", prescriptionRoutes);


// Error Handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${PORT}`);
});

// Enable SO_REUSEADDR to allow fast restarts
if (server._handle) {
    server._handle.setBlocking(false);
}

// Handle port already in use error with retry logic
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`\n📝 Fix options:`);
        console.error(`   1. Kill the existing process: netstat -ano | findstr :${PORT}, then taskkill /PID <PID> /F`);
        console.error(`   2. Change PORT env variable: set PORT=5001 or PORT=3000\n`);
        setTimeout(() => process.exit(1), 500);
    } else {
        console.error('Server error:', err);
        process.exit(1);
    }
});

// Graceful shutdown for file changes (nodemon restarts)
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});