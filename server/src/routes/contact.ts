import express from 'express';
import { sendContactEmail } from '../controllers/contactController';

const router = express.Router();

router.post('/', sendContactEmail);

export default router;
