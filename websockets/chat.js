import app from "../app";
import { Server } from "socket.io";
import { createServer } from "node:http";

const server = createServer(app);
const io = new Server(server);

export const chatSocket = io.on("connection", (socket) => {
  console.log("a user connected");
});
