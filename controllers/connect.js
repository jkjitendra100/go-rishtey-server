import mongoose from "mongoose";
import Connect from "../models/connect.js";
import ErrorHandler from "../utils/Errorhandler.js";
import User from "../models/account/user.js";

export const newConnection = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return next(new ErrorHandler("Invalid receiver ID", 400));
    }

    if (req.user?._id === receiverId)
      return next(new ErrorHandler("User ID and Receiver ID are same", 400));

    // Check existing connection
    const existingConnection = await Connect.findOne({
      senderId: req?.user?._id,
      receiverId,
    });
    if (existingConnection) {
      return next(new ErrorHandler("Connection already exists", 400));
    }

    const connect = await Connect.create({
      senderId: req?.user?._id,
      receiverId,
    });

    res.status(201).json({
      success: true,
      message: "New connection created successfully",
      data: connect,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getConnectionsRequestsFromMe = async (req, res, next) => {
  try {
    const { status } = req?.params; // sent, accepted, rejected

    const connections = await Connect.aggregate([
      {
        $match: { senderId: req?.user?._id, status: status },
      },
      {
        $lookup: {
          from: "profiles",
          let: { userId: "$receiverId" },
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
          from: "shortlists",
          let: { userId: req?.user?._id, shortlistedUserId: "$receiverId" },
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
          from: "users",
          let: { userId: "$receiverId" },
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
          from: "connects",
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
          as: "connection",
        },
      },
    ]);

    res.status(200).send({
      success: true,
      message: "Connections found",
      data: connections,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getMySentConnections = async (req, res, next) => {
  try {
    const connections = await Connect.aggregate([
      {
        $match: { senderId: req?.user?._id, status: "sent" },
      },
      {
        $lookup: {
          from: "profiles",
          let: { userId: "$receiverId" },
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
          from: "shortlists",
          let: { userId: req?.user?._id, shortlistedUserId: "$receiverId" },
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
          from: "users",
          let: { userId: "$receiverId" },
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
          from: "connects",
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
          as: "connection",
        },
      },
    ]);

    res.status(200).send({
      success: true,
      message: "Connections found",
      data: connections,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getConnectionRequestsToMe = async (req, res, next) => {
  try {
    // const connectionRequests = await Connect.find({
    //   receiverId: req?.user?._id,
    // });

    const connectionRequests = await Connect.aggregate([
      {
        $match: { receiverId: req?.user?._id, status: "sent" },
      },
      {
        $lookup: {
          from: "profiles",
          let: { userId: "$senderId" },
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
          from: "shortlists",
          let: { userId: req?.user?._id, shortlistedUserId: "$senderId" },
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
          from: "users",
          let: { userId: "$senderId" },
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
          from: "connects",
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
          as: "connection",
        },
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Requests found",
      data: connectionRequests,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getMyAcceptedConnections = async (req, res, next) => {
  try {
    const connectionRequests = await Connect.aggregate([
      {
        $match: { receiverId: req?.user?._id, status: "accepted" },
      },
      {
        $lookup: {
          from: "profiles",
          let: { userId: "$senderId" },
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
          from: "shortlists",
          let: { userId: req?.user?._id, shortlistedUserId: "$senderId" },
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
          from: "users",
          let: { userId: "$senderId" },
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
          from: "connects",
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
          as: "connection",
        },
      },
    ]);

    res.status(201).json({
      success: true,
      message: "Requests found",
      data: connectionRequests,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const updateConnectionStatus = async (req, res, next) => {
  try {
    const { status, id } = req.body; // accepted or rejected, Connection ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler("Invalid connection ID", 400));
    }
    if (!status) {
      return next(new ErrorHandler("Status required", 400));
    }

    // Check existing connection
    const existingConnection = await Connect.findById(id);
    if (!existingConnection) {
      return next(new ErrorHandler("Connection not found", 404));
    }

    existingConnection.status = status;
    await existingConnection.save();

    res.status(201).json({
      success: true,
      message: "Status updated successfully",
      data: existingConnection,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const deleteConnection = async (req, res, next) => {
  try {
    const { id } = req.params; // Connection ID
    const connection = await Connect.findById(id);

    if (connection?.status === "sent") {
      await connection.deleteOne();
      res.status(201).json({
        success: true,
        message: "Connection deleted successfully",
      });
    } else {
      return next(new ErrorHandler("Can't be cancelled", 400));
    }
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};
