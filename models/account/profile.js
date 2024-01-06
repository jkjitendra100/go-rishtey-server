import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  dob: {
    type: Number,
    required: [true, "DOB required"],
  },

  motherTongue: {
    type: String,
    required: [true, "Mother tongue required"],
  },

  community: {
    type: String,
    required: [true, "Community required"],
  },

  maritalStatus: {
    type: String,
    required: [true, "Marital status required"],
  },

  height: {
    type: String,
    required: [true, "Height required"],
  },

  state: {
    type: String,
    required: [true, "State required"],
  },

  city: {
    type: String,
    required: [true, "City required"],
  },

  pinCode: {
    type: Number,
    required: [true, "Pin code required"],
    minLength: [6, "Pin code must be of 6 digits"],
    maxLength: [6, "Pin code must be of 6 digits"],
  },

  // Career Family
  highestDegree: {
    type: String,
    required: [true, "Highest degree required"],
  },
  jobTitle: {
    type: String,
    required: [false, "Job title required"],
  },
  employedIn: {
    type: String,
    required: [false, "Employed in required"],
  },
  annualIncome: {
    type: String,
    required: [true, "Annual income required"],
  },
  familyType: {
    type: String,
    required: [true, "Family type required"],
  },
  fatherStatus: {
    type: String,
    required: [true, "Father status required"],
  },
  motherStatus: {
    type: String,
    required: [true, "Mother status required"],
  },
  noOfBrothers: {
    type: String,
    required: [true, "No of brothers required"],
  },
  noOfSisters: {
    type: String,
    required: [true, "No of sisters required"],
  },
  familyLivingIn: {
    type: String,
    required: [true, "Family living in required"],
  },

  // Images
  images: [
    {
      docPath: {
        type: String,
        required: [true, "path required"],
      },
      docUrl: {
        type: String,
        required: [true, "URL required"],
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID required"],
  },
});

export default mongoose.model("Profile", profileSchema);
