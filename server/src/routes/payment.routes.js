import express from 'express';

import {
  createOrder,
  verifyPayment,
  mockPayment,
  getWallet,
  getPaymentHistory,
} from '../controllers/payment.controller.js';

import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', protect, restrictTo('client'), createOrder);
router.post('/verify', protect, restrictTo('client'), verifyPayment);
router.post('/mock-pay', protect, restrictTo('client'), mockPayment);
router.get('/wallet', protect, getWallet);
router.get('/history', protect, restrictTo('client'), getPaymentHistory);

export default router;