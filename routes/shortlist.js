import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getMyShortlistedUsers,
  newShortlist,
  deleteShortlist,
} from "../controllers/shortlist.js";

const router = express.Router();

router.post("/new", isAuthenticated, newShortlist);
router.get("/my", isAuthenticated, getMyShortlistedUsers);
router.delete("/delete/:shortlistedUserId", isAuthenticated, deleteShortlist);

export default router;
