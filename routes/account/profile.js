import express from "express";
import {
  createProfile,
  deleteImage,
  deleteProfile,
  getAllUsersProfile,
  getGenderWiseUsersProfile,
  getMyProfile,
  getUserProfile,
  updateProfile,
  updateUserImage,
} from "../../controllers/account/profile.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/new", isAuthenticated, createProfile);
router.get("/my", isAuthenticated, getMyProfile);
router.put("/update", isAuthenticated, updateProfile);
router.get("/all", isAuthenticated, getAllUsersProfile);
router.get("/:id", isAuthenticated, getUserProfile);
router.get("/genderWise/:gender", isAuthenticated, getGenderWiseUsersProfile);
router.delete("/delete", isAuthenticated, deleteProfile);
router.delete("/image/:id", isAuthenticated, deleteImage); // Image id to be deleted
router.put("/image", isAuthenticated, updateUserImage);

export default router;
