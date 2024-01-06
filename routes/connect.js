import express from "express";
import {
  updateConnectionStatus,
  getConnectionsRequestsFromMe,
  getConnectionRequestsToMe,
  newConnection,
  deleteConnection,
  getMySentConnections,
} from "../controllers/connect.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/new", isAuthenticated, newConnection);
router.get("/my/:status", isAuthenticated, getConnectionsRequestsFromMe); // Requests from my side
router.get("/sent", isAuthenticated, getMySentConnections);
router.get("/requests", isAuthenticated, getConnectionRequestsToMe); // Requests from user side
router.put("/update", isAuthenticated, updateConnectionStatus);
router.delete("/delete/:id", isAuthenticated, deleteConnection);

export default router;
