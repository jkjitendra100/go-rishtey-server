import ErrorHandler from "../utils/Errorhandler.js";

function errorMiddleWare(err, req, res, next) {
  if (err instanceof ErrorHandler) {
    err.statusCode = err.status || 500;
    err.message = err.message || "Internal Server Error";

    // Wrong mongoDB ID error
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid ${err.path}`;
      err = new ErrorHandler(message, 400);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
      err = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (err.name === "jsonWebTokenError") {
      const message = `Json Web Token is invalid, please try again`;
      err = new ErrorHandler(message, 400);
    }

    // JWT expiry error
    if (err.name === "TokenExpiredError") { 
      const message = `JWT is expired, please try again`;
      err = new ErrorHandler(message, 400);
    }

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
}

export default errorMiddleWare;
