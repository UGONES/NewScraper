import express from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import {
  getAdminSummary
} from "../controllers/adminController.js";
import {
  getAllUsers,
  createUserByAdmin,
  updateUser,
  deleteUser,
  getUserById
} from "../controllers/userController.js";
import {
  getOwnScrapes,
  getAllScrapes
} from "../controllers/scrapeController.js";
import {
  getUserProfile,
  updateUserProfile
} from "../controllers/userController.js";

const router = express.Router();
router.use(verifyToken, isAdmin);

router.get("/summary", getAdminSummary);
router.get("/users", getAllUsers);
router.post("/users", createUserByAdmin);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/scrapes", getOwnScrapes);        // Admin’s own
router.get("/scrape/all", getAllScrapes);     // All AI scrapes
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

export default router;
