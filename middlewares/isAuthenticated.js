import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/Errorhandler.js";
import User from "../models/account/user.js";

export default async function isAuthenticated(req, res, next) {
  try {
    // const { token } = req.cookies;
    let token;
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer")) {
      token = authorizationHeader.split(" ")[1];
    } else {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new ErrorHandler("User is not logged in, please login first", 400)
      );
    }

    const { id } = jwt.verify(token, process.env.JET_SECRET);
    const user = await User.findById(id);
    if (!user) {
      return next(
        new ErrorHandler("Not a valid token, Please login again", 400)
      );
    }

    req.user = user;

    next();
  } catch (err) {
    // res.status(500).json({ success: false, error: err.message });
    return next(new ErrorHandler(err?.message, 500));
  }
}
