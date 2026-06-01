import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.routes';
import { setupSocketHandlers } from './sockets/presence';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: '*', // For local dev flexibility
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Stripe webhook must receive the raw request body for signature verification.
// Apply express.raw() to this specific path BEFORE the general express.json() middleware.
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// API Base Route
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), service: 'Zenith Engine' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server exception:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const server = http.createServer(app);

// Connect Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Zenith Server successfully listening on http://localhost:${PORT}`);
});
