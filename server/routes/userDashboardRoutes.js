import express from "express";
import { verifyToken, isUser } from "../middleware/authMiddleware.js";
import { getOwnAIScrapes } from "../controllers/scrapeController.js";
import {
    getUserProfile,
    updateUserProfile,
    getUserSummary
} from "../controllers/userController.js";

const router = express.Router();
router.use(verifyToken, isUser);

router.get("/summary", getUserSummary);
router.get("/scrapes", getOwnAIScrapes);
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

export default router;
