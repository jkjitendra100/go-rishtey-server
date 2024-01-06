import mongoose from "mongoose";

const shortlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User id required"],
  },

  shortlistedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Shortlisted user id required"],
  },

  status: {
    type: String,
    enum: ["sent", "accepted", "rejected"],
    default: "sent",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Shortlist", shortlistSchema);
