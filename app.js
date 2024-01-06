import express from "express";
import ErrorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "*",
    methods: "GET,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZcbsXcIW5PyXewI8QcNF4pOkZm5yotxs",
  authDomain: "sadi-karen.firebaseapp.com",
  projectId: "sadi-karen",
  storageBucket: "sadi-karen.appspot.com",
  messagingSenderId: "888190890673",
  appId: "1:888190890673:web:e572ff7ab2954fff3be890",
};
initializeApp(firebaseConfig);

// Routes import
import user from "./routes/account/user.js";
import profile from "./routes/account/profile.js";
import { initializeApp } from "firebase/app";
import connect from "./routes/connect.js";
import shortlist from "./routes/shortlist.js";

app.get("/", (req, res) => res.send("Server is working"));

let baseUrl = "/api/gorishtey/v1";

app.use(`${baseUrl}/user`, user);
app.use(`${baseUrl}/profile`, profile);
app.use(`${baseUrl}/connect`, connect);
app.use(`${baseUrl}/shortlist`, shortlist);
// app.use(`${baseUrl}/career`, career);
// app.use(`${baseUrl}/family`, family);
// app.use(`${baseUrl}/preferences`, preferences);
// app.use(`${baseUrl}/notification`, notification);
// app.use(`${baseUrl}/report`, report);
// app.use(`${baseUrl}/block`, block);
// app.use(`${baseUrl}/activity`, activity);
// app.use(`${baseUrl}/chat`, chat);
// app.use(`${baseUrl}/message`, message);

// Middlewares for errors
app.use(ErrorMiddleware);

export default app;
