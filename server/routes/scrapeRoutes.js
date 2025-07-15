import express from 'express';
import { body } from 'express-validator';
import {
  createScrape,
  getOwnAIScrapes,
  getAllAIScrapes
} from '../controllers/scrapeController.js';
import { verifyToken, isAdmin, allowUserOrAdmin } from '../middleware/authMiddleware.js';
import { validateScrapeInput } from '../middleware/validateMiddleware.js';

const router = express.Router();
router.use(verifyToken);

// ✅ Create scrape
router.post(
  '/user',
  allowUserOrAdmin,
  [
    body('input')
      .exists().withMessage('Input is required')
      .isString().withMessage('Input must be a string'),
  ],
  validateScrapeInput,
  createScrape
);

// ✅ Get user AI scrapes
router.get('/user', allowUserOrAdmin, getOwnAIScrapes);

// ✅ Get all AI scrapes (admin)
router.get('/admin', isAdmin, getAllAIScrapes);

export default router;
