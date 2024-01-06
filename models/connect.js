import mongoose from "mongoose";

const connectSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Sender id required"],
  },

  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Receiver id required"],
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

export default mongoose.model("Connect", connectSchema);
