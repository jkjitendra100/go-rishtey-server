import express from "express";
import {
  deletePhoto,
  deleteUser,
  forgotPassword,
  getAllUsers,
  getMyPhotos,
  getSingleUsers,
  getUserDetails,
  loginUser,
  logout,
  registerUser,
  resetPassword,
  searchUserByCustomId,
  sendOtp,
  updatePassword,
  updateProfile,
  updateRole,
  uploadPhotos,
  verifyOtp,
} from "../../controllers/account/user.js";
// import isAuthenticated from "../middlewares/account/isAuthenticated.js";
import isAdmin from "../../middlewares/isAdmin.js";
import isAuthenticated from "../../middlewares/isAuthenticated.js";
import singleUpload from "../../middlewares/multer.js";

const router = express.Router();

router.post("/new", registerUser);
router.post("/login", loginUser);
router.put("/sendOtp", sendOtp);
router.put("/verifyOtp", verifyOtp);
router.post("/logout", isAuthenticated, logout);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);
router.put("/password/update", isAuthenticated, updatePassword);
router.get("/me", isAuthenticated, getUserDetails);
router.get("/search/:customId", isAuthenticated, searchUserByCustomId);
router.patch("/me/update", isAuthenticated, updateProfile);
router.get("/admin/all", isAdmin, getAllUsers);
router.get("/admin/all/:id", isAdmin, getSingleUsers);
router.patch("/admin/all/:id/update", isAdmin, updateRole);
router.delete("/admin/all/:id/delete", isAdmin, deleteUser);
router.patch("/photos", isAuthenticated, singleUpload, uploadPhotos);
router.delete("/deleteImage/:id", isAuthenticated, deletePhoto);
router.get("/myImages", isAuthenticated, getMyPhotos);

export default router;
