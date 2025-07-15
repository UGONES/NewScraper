import express from 'express';

import authRoutes from './authRoutes.js';
import dataRoutes from './dataRoutes.js';
import scrapeRoutes from './scrapeRoutes.js';
import adminDashboardRoutes from './adminDashboardRoutes.js';
import userDashboardRoutes from './userDashboardRoutes.js';
import contactRoutes from './contactRoutes.js';

const router = express.Router();

// Attach all API subroutes
router.use('/auth', authRoutes);
router.use('/data', dataRoutes);
router.use('/scrape', scrapeRoutes);
router.use('/dashboard/admin', adminDashboardRoutes);
router.use('/dashboard/user', userDashboardRoutes);
router.use('/contact', contactRoutes);

export default router;

// ✅ Final API routes mounted under /api in server.js
// Example: GET /api/auth/login, POST /api/data, etc.
// This structure keeps routes organized and modular, making it easier to maintain and extend the API in the future.
// Each route file handles its own logic, controllers, and middleware, promoting separation of concerns.