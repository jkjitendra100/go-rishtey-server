import app from "./app.js";
import dotenv from "dotenv";
import connectDb from "./config/database.js";
// Socket.io
import { Server } from "socket.io";
import { createServer } from "node:http";

// Config
dotenv.config({ path: "config/config.env" });

// Connecting to database
connectDb();

// Chat web socket connection

// Uncaught promise rejection
process.on("uncaughtException", (err) => {
  console.log(err.message);
  console.log(
    "Shutting down the server due to uncaught exception: " + err.message
  );

  server.close(() => {
    process.exit(1);
  });
});

// Socket.io for chatting
const chatServer = createServer(app);
const io = new Server(chatServer, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected: ", socket);
  socket.on("setup", (userData) => {
    socket.join(userData?._id);
    socket.emit("Connected");
  });
});

// Listening the server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// Unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(err.message);
  console.log(
    "Shutting down the server due to unhandledRejection exception: " +
      err.message
  );

  server.close(() => {
    process.exit(1);
  });
});
