import User from "../../models/account/user.js";
import ErrorHandler from "../../utils/Errorhandler.js";
import bcryptjs from "bcryptjs";
import validator from "validator";
import sendToken from "../../utils/sendToken.js";
import sendEmail from "../../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import Profile from "../../models/account/profile.js";
import user from "../../models/account/user.js";

// Register user
export const registerUser = async (req, res, next) => {
  try {
    const {
      profileFor,
      gender,
      name,
      email,
      mobile,
      dob,
      motherTongue,
      community,
      maritalStatus,
      height,
      state,
      city,
      pinCode,
      highestDegree,
      jobTitle,
      employedIn,
      annualIncome,
      familyType,
      fatherStatus,
      motherStatus,
      noOfBrothers,
      noOfSisters,
      familyLivingIn,
      images,
    } = req.body;

    // Check if the user already exists based on the email
    const existingUserMobile = await User.findOne({ mobile });
    if (existingUserMobile) {
      return next(
        new ErrorHandler(`User with mobile no: "${mobile}" already exists!`)
      );
    }

    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return next(
        new ErrorHandler(`User with email: "${email}" already exists!`)
      );
    }

    let countDocuments = await User.countDocuments();

    const user = await User.create({
      profileFor,
      gender,
      name,
      email,
      mobile,
      customId: countDocuments + 1001,
    });

    const profile = await Profile.create({
      dob,
      motherTongue,
      community,
      maritalStatus,
      height,
      state,
      city,
      pinCode,
      highestDegree,
      jobTitle,
      employedIn,
      annualIncome,
      familyType,
      fatherStatus,
      motherStatus,
      noOfBrothers,
      noOfSisters,
      familyLivingIn,
      images,
      userId: user?._id,
    });

    user.profile = profile._id;

    await user.save();

    sendToken(user, 201, res, "User registered successfully");
    // }
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const checkExistingUser = async (req, res, next) => {
  try {
    const { email, mobile } = req.body;

    const userByEmail = await User.findOne({ email: email });
    if (userByEmail) {
      return next(new ErrorHandler(`${email} already exists!`));
    }

    const userByMobile = await User.findOne({ mobile: mobile });
    if (userByMobile) {
      return next(new ErrorHandler(`${mobile} already exists!`));
    }

    res.status(200).json({
      success: true,
      message: "Valid user",
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const checkToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return next(new ErrorHandler("Token not found", 404));
    }

    const { id } = jwt.verify(token, process.env.JET_SECRET);
    if (!id) {
      return next(new ErrorHandler("Invalid token", 400));
    }

    res.status(200).json({
      success: true,
      message: "Token verified",
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Send OTP
export const sendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) return next(new ErrorHandler("Mobile no. is not valid", 400));

    let otp = Math.floor(1000 + Math.random() * 9000);
    await User.findOneAndUpdate(
      { mobile: Number(mobile) },
      { otp: otp, otpValidity: Date.now() + 15 * 60 * 1000 },
      { runValidators: false }
    );

    res.status(201).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Send OTP
export const verifyOtp = async (req, res, next) => {
  try {
    const { otp, mobile } = req.body;

    if (!mobile) return next(new ErrorHandler("Mobile no. required", 400));
    if (!otp) return next(new ErrorHandler("OTP required", 400));

    const existingUser = await User.findOne({
      mobile: Number(mobile),
    });

    if (!existingUser)
      return next(new ErrorHandler(`"${mobile}" is not registered`, 404));

    if (existingUser?.otp !== Number(otp)) {
      return next(new ErrorHandler("Wrong OTP", 400));
    }

    await User.findOneAndUpdate(
      { mobile: Number(mobile) },
      { otpVerified: true },
      { runValidators: false }
    );

    sendToken(existingUser, 200, res, "OTP verified successfully");
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Login user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const isValidEmail = validator.isEmail(email);

    if (!isValidEmail) {
      return next(new ErrorHandler(`Invalid email`, 400));
    }

    const existingUser = await User.findOne({
      email: { $regex: new RegExp(email, "i") },
    }).select("+password");

    if (!existingUser)
      return new ErrorHandler(
        `${email} is not registered, Please register now`,
        404
      );

    const isMatched = await bcryptjs.compare(password, existingUser.password);

    if (!isMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect email or password" });
    }

    const message = "User logged in successfully";

    sendToken(existingUser, 200, res, message);
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  let user;
  try {
    user = await User.findOne({ email: req.body.email });
    if (!user) return next(new ErrorHandler(`User not found`, 400));

    // Get reset password token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it.`;

    await sendEmail({
      email: user.email,
      subject: "eCommerce password recovery",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (e) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(e.message, 500));
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    // Creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler(
          "Reset password token is invalid or has been expired",
          400
        )
      );
    }

    if (reg.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler("Password does not matched", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    let message = "Password updated successfully";
    sendToken(user, 200, res, message);
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Get user details
export const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("profile");

    if (!user) return next(new ErrorHandler("User not found", 404));

    sendToken(user, 200, res, "User found");
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Update Password
export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword)
      return next(new ErrorHandler("Old password required", 400));

    const user = await User.findById(req.user.id).select("+password");
    if (!user) return next(new ErrorHandler("User not found", 404));

    const isMatched = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatched)
      return next(new ErrorHandler("Old password is incorrect", 400));

    if (newPassword !== confirmPassword)
      return next(new ErrorHandler("Password does not match", 400));

    user.password = newPassword;

    await user.save();

    sendToken(user, 200, res, "Password updated successfully");
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { profileFor, mobile, email, gender } = req.body;
    const newUpdatedData = { profileFor, mobile, email, gender };

    const user = await User.findByIdAndUpdate(req.user._id, newUpdatedData, {
      new: true,
      runValidators: true,
      useFindAndUpdate: false,
    });

    res
      .status(200)
      .send({ success: true, message: "Profile updated successfully" });

    // We will add firebase letter
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).send({ success: true, users });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Get single user
export const getSingleUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("User not found", 400));

    res.status(200).send({ success: true, user });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Update user role
export const updateRole = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const newUpdatedData = { email, role };

    const user = await User.findByIdAndUpdate(req.params.id, newUpdatedData, {
      new: true,
      runValidators: true,
      useFindAndUpdate: false,
    });

    if (!user) return next(new ErrorHandler("User not found", 404));

    res
      .status(200)
      .send({ success: true, user, message: "Profile updated successfully" });

    // We will remove firebase letter
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User not found", 400));

    await Profile.findOneAndDelete({ userId: req.params.id });

    await user.deleteOne();

    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res
      .status(200)
      .send({ success: true, message: "User deleted successfully" });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Upload photos
export const uploadPhotos = async (req, res, next) => {
  try {
    const user = await User.findById(req?.user?._id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const images = req.files;
    const storage = getStorage();

    if (!images || images.length === 0) {
      return next(new ErrorHandler("Images not found", 404));
    }

    let imagesList = [];

    // Use Promise.all to wait for all asynchronous calls to complete
    await Promise.all(
      images.map(async (image, index) => {
        const fileName = `userProfiles/${req?.user?._id?.toString()}/${Date.now()?.toString()}`;
        const metadata = {
          contentType: image.mimetype,
        };
        // Upload file and metadata to the object 'images/mountains.jpg'
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(
          storageRef,
          image.buffer,
          metadata
        );

        try {
          // Wait for the upload to complete
          await uploadTask;

          // Get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          // Push image details to the imagesList array
          imagesList.push({
            docPath: fileName,
            docUrl: downloadURL,
          });

          // update photos in database
        } catch (error) {
          console.error("Error uploading: ", error);
        }
      })
    );

    const updatedUser = await User.findByIdAndUpdate(
      req?.user?._id,
      {
        images: [...imagesList, ...user?.images],
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Images uploaded successfully",
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Get user photos
export const getMyPhotos = async (req, res, next) => {
  try {
    const user = await User.findById(req?.user?._id);
    if (!user) return next(new ErrorHandler("User not found", 404));

    res.status(200).json({
      success: true,
      message: "User found",
      data: user?.images,
    });
  } catch (e) {
    next(new ErrorHandler(e.message, 500));
  }
};

export const deletePhoto = async (req, res, next) => {
  const { imageId } = req.params;
  console.log(imageId);
  try {
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Find user by custom ID
export const searchUserByCustomId = async (req, res, next) => {
  try {
    const { customId } = req.params;
    const user = await User.aggregate([
      {
        $match: { customId: Number(customId) },
      },
      {
        $lookup: {
          from: "connects",
          let: { senderId: req?.user?._id, receiverId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$senderId", "$$senderId"] },
                    { $eq: ["$receiverId", "$$receiverId"] },
                  ],
                },
              },
            },
          ],
          as: "connection",
        },
      },
      {
        $lookup: {
          from: "shortlists",
          let: { userId: req?.user?._id, shortlistedUserId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", "$$userId"] },
                    { $eq: ["$shortlistedUserId", "$$shortlistedUserId"] },
                  ],
                },
              },
            },
          ],
          as: "shortlist",
        },
      },
      {
        $lookup: {
          from: "profiles",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$userId"],
                },
              },
            },
          ],
          as: "profile",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userId"],
                },
              },
            },
          ],
          as: "user",
        },
      },
    ]);

    if (user?.length === 0) {
      return next(new ErrorHandler("Profile Not Found", 400));
    }
    if (user?.customId === Number(customId))
      return next(new ErrorHandler("you can find only other user", 400));

    res.status(200).send({ success: true, data: user });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};
