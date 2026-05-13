import express from 'express';
import { getTransactions, loadWallet, getBalance } from '../controllers/walletController';
import { authenticate } from '../utils/authMiddleware';

const router = express.Router();

router.get('/history', authenticate, getTransactions);
router.get('/balance', authenticate, getBalance);
router.post('/load', authenticate, loadWallet);

export default router;