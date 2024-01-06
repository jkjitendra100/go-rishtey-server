import ErrorHandler from "../../utils/Errorhandler.js";
import Profile from "../../models/account/profile.js";
import User from "../../models/account/user.js";
import sendToken from "../../utils/sendToken.js";
import mongoose from "mongoose";

export const createProfile = async (req, res, next) => {
  try {
    const {
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

    // Check weather user profile exists or not
    const profileExists = await Profile.findOne({ userId: req?.user?._id });

    if (profileExists) {
      return next(new ErrorHandler("Profile already exists", 400));
    }

    const userProfile = await Profile.create({
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
      userId: req?.user?._id,
    });

    const user = await User.findByIdAndUpdate(
      req?.user?._id,
      { profile: userProfile?._id },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: userProfile,
      user: user,
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
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
    } = req.body;

    // Check weather user profile exists or not
    const profileExists = await Profile.findOne({ userId: req?.user?._id });

    if (!profileExists) {
      return next(new ErrorHandler("User profile not found", 404));
    }

    const userProfile = await Profile.findOneAndUpdate(
      { userId: req?.user?._id },
      {
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
        userId: req?.user?._id,
      },
      { new: true, runValidators: false }
    );

    const user = await User.findById(req?.user?._id)?.populate("profile");

    // get user details and update with profile

    res.status(201).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    console.log(req?.user?._id);
    const user = await User.findById(req?.user?._id);

    if (!user) {
      return next(new ErrorHandler("User profile not found", 404));
    }
    sendToken(user, 200, res, "User found");
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getAllUsersProfile = async (req, res, next) => {
  try {
    const profile = await User.aggregate([
      // {
      //   $match: { gender: "Male" },
      // },
      // {
      //   $lookup: {
      //     from: "connects",
      //     let: { senderId: req?.user?._id, receiverId: "$_id" },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ["$senderId", "$$senderId"] },
      //               { $eq: ["$receiverId", "$$receiverId"] },
      //             ],
      //           },
      //         },
      //       },
      //     ],
      //     as: "connection",
      //   },
      // },
      {
        $lookup: {
          from: "profiles",
          let: { currentUserId: req?.user?._id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$currentUserId"],
                },
              },
            },
          ],
          as: "profile",
        },
      },
    ]);

    if (!profile || profile.length === 0) {
      return next(new ErrorHandler("Profile not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profiles found",
      data: profile,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getUserProfile = async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new ErrorHandler("Invalid ID", 400));

  try {
    const profile = await User.findById(id).populate("profile");
    res.status(200).json({
      success: true,
      message: "Profiles found",
      data: profile,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

// Here i am fetching gender wise documents from users, connects and profiles collections
export const getGenderWiseUsersProfile = async (req, res, next) => {
  const { gender } = req.params; // Male or Female
  try {
    const profile = await User.aggregate([
      {
        $match: { gender: gender },
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

    if (!profile || profile.length === 0) {
      return next(new ErrorHandler("Profile not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profiles found",
      data: profile,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    await Profile.findOneAndDelete({ userId: req?.user?._id });

    res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const deleteImage = async (req, res, next) => {
  try {
    const { docUrl } = req.query;

    const profile = await Profile.find({ userId: req?.user?._id });

    let updatedImages = profile?.images?.filter((e) => e?.docUrl !== docUrl);

    await Profile.updateOne(
      { userId: req?.user?._id },
      { images: updatedImages }
    );

    const user = await User.findById(req?.user?._id).populate("profile");
    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: user,
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};
