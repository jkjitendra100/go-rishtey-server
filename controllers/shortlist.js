import mongoose from "mongoose";
import ErrorHandler from "../utils/Errorhandler.js";
import Shortlist from "../models/shortlist.js";

export const newShortlist = async (req, res, next) => {
  try {
    const { shortlistedUserId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(shortlistedUserId)) {
      return next(new ErrorHandler("Invalid shortlisted user ID", 400));
    }

    if (req.user?._id === shortlistedUserId)
      return next(
        new ErrorHandler("User ID and shortlisted user ID are same", 400)
      );

    // Check existing connection
    const existingShortlistedUser = await Shortlist.findOne({
      userId: req?.user?._id,
      shortlistedUserId: shortlistedUserId,
    });
    if (existingShortlistedUser) {
      return next(new ErrorHandler("this user is already shortlisted", 400));
    }

    const shortlist = await Shortlist.create({
      userId: req?.user?._id,
      shortlistedUserId,
    });

    res.status(201).json({
      success: true,
      message: "User shortlisted successfully",
      data: shortlist,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getMyShortlistedUsers = async (req, res, next) => {
  try {
    const shortlists = await Shortlist.aggregate([
      {
        $match: { userId: req?.user?._id },
      },
      {
        $lookup: {
          from: "profiles",
          let: { userId: "$shortlistedUserId" },
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
          let: { userId: "$shortlistedUserId" },
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
      {
        $lookup: {
          from: "shortlists",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$userId"] }],
                },
              },
            },
          ],
          as: "shortlist",
        },
      },
      {
        $lookup: {
          from: "connects",
          let: { senderId: req?.user?._id, receiverId: "$shortlistedUserId" },
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
    ]);

    res.status(200).send({
      success: true,
      message: "Shortlisted users found",
      data: shortlists,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const deleteShortlist = async (req, res, next) => {
  try {
    const { shortlistedUserId } = req.params;
    await Shortlist.findOneAndDelete({
      userId: req?.user?._id,
      shortlistedUserId,
    });

    res.status(200).send({
      success: true,
      message: "Un-shortlist successful",
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};
