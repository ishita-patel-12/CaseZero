import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import { initSocket } from './socket.js';

const port = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

async function startServer() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('[CaseZero] CRITICAL: MONGO_URI environment variable is not defined.');
  } else {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000
      });
      console.log(`[CaseZero] MongoDB connected successfully to database: "${mongoose.connection.name}"`);
    } catch (err) {
      console.error('[CaseZero] Initial MongoDB connection failed:', err.message);
      console.error('[CaseZero] The server will still start, but database requests will fail until MongoDB Atlas is reachable.');
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('[CaseZero] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[CaseZero] MongoDB connection disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[CaseZero] MongoDB connection re-established.');
  });

  const server = http.createServer(app);
  initSocket(server, clientUrl);

  server.listen(port, '0.0.0.0', () => {
    console.log(`[CaseZero] API & Socket server running on port ${port}`);
  });

  const shutdown = async () => {
    console.log('[CaseZero] Shutting down gracefully...');
    server.close(() => {
      mongoose.connection.close(false).then(() => {
        console.log('[CaseZero] HTTP and database connections closed.');
        process.exit(0);
      });
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();

