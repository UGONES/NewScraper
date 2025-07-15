import express from "express";
import { verifyToken, isUser } from "../middleware/authMiddleware.js";
import { getUserSummary } from "../controllers/userdController.js";
import { getOwnScrapes } from "../controllers/scrapeController.js";
import { getUserProfile, updateUserProfile } from "../controllers/userController.js";

const router = express.Router();
router.use(verifyToken, isUser);

router.get("/summary", getUserSummary);
router.get("/scrapes", getOwnScrapes);
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

export default router;
