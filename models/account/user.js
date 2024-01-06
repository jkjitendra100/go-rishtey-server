import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  profileFor: {
    type: String,
    required: [true, "Profile for required"],
  },

  gender: {
    type: String,
    required: [false, "Gender required"],
  },

  name: {
    type: String,
    required: [false, "Name required"],
  },

  email: {
    type: String,
    required: [true, "Please enter email address"],
    trim: true,
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },

  mobile: {
    type: Number,
    unique: true,
    required: [true, "Please enter mobile number"],
    minlength: [10, "Mobile no. must be at least 10 digits"],
    maxlength: [10, "Mobile no. must be at most 10 digits"],
  },

  profile: {
    type: mongoose.Types.ObjectId,
    ref: "Profile",
  },

  // password: {
  //   type: String,
  //   required: [true, "Please enter password"],
  //   trim: true,
  //   minLength: [6, "Password must be at least 8 characters"],
  //   select: false,
  // },

  role: {
    type: String,
    enum: [
      "superAdmin",
      "admin",
      "starUser",
      "goldUser",
      "platinumUser",
      "diamondUser",
      "user",
    ],
    default: "user",
  },

  // OTP
  otp: {
    type: Number,
  },

  otpValidity: {
    type: Date,
    default: Date.now,
  },

  otpVerified: {
    type: Boolean,
    default: false,
  },

  // ID Verification
  // idType: {
  //   type: String,
  //   enum: ["pan", "dl"],
  // },

  // idNumber: {
  //   type: String,
  //   unique: true,
  // },

  customId: {
    type: Number,
    required: [true],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
  resetPasswordExpiry: Date,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 10);
    return next();
  }
  next();
});

// JWT TOKEN
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JET_SECRET, {
    expiresIn: process.env.JET_EXPIRE,
  });
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function () {
  // Generating token
  const resetToken = crypto.randomBytes(20).toString("hax");
  // Hashing and add to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("User", userSchema);
