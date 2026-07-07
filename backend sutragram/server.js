import express from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import apiRoutes from "./routes/index.js";
import initializeChatSocket from "./socket.js";
import setupCronJobs from "./config/cron.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingInterval: 25000,
  pingTimeout: 60000,
});
const PORT = process.env.PORT || 5001;

// Increase timeout for file uploads (30 seconds)
httpServer.setTimeout(30000);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
// NOTE: express-fileupload removed from global middleware to prevent conflict with multer
// It's now applied locally in routes that need it (e.g., userRoutes.js)

// CORS middleware allowing all for now
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

//  Connect db and cloudinary
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}


//  API Endpoint
app.get("/", (req, res) => {
  res.send("Artisan Showcase Platform API");
});

// API Routes V1
app.use("/api/v1", apiRoutes);
// Backward-compatible base routes for tests and legacy clients
app.use("/api", apiRoutes);

// Initialize Chat Socket.IO functionality
initializeChatSocket(io);

// Make io available to routes
app.set('io', io);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Export app for testing
export default app;

// Global error handlers to prevent server crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Server is accessible on all network interfaces (0.0.0.0:${PORT})`);
    console.log(`📡 Socket.IO is ready for real-time messaging`);
    
    // Setup cron jobs for analytics aggregation
    setupCronJobs();
  });
}
