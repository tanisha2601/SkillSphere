import { Router } from 'express';
import mongoose from 'mongoose';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  const healthData = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
    database: dbStatus,
  };

  res.status(200).json(new ApiResponse(200, healthData, 'Server health check passed'));
});

export default router;
