import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Gig title is required"],
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 3000,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    subCategory: {
      type: String,
      default: "",
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    experienceLevel: {
  type: String,
  enum: [
    "Beginner",
    "Intermediate",
    "Expert",
  ],
  default: "Intermediate",
},

location: {
  type: String,
  default: "",
},

remoteAllowed: {
  type: Boolean,
  default: true,
},

recommendedFreelancers: [
  {
    freelancer: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    matchScore: Number,
  },
],

completionPercentage: {
  type: Number,
  default: 0,
},

milestones: [
  {
    title: String,

    status: {
      type: String,
      enum: [
        "pending",
        "in-progress",
        "completed",
      ],
      default: "pending",
    },

    deadline: Date,
  },
],

priority: {
  type: String,
  enum: [
    "low",
    "medium",
    "high",
  ],
  default: "medium",
},

    images: [
      {
        type: String,
      },
    ],

    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: 1,
    },

    deliveryTime: {
      type: Number,
      required: true,
      min: 1,
    },

    revisions: {
      type: Number,
      default: 0,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedFreelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    proposalsCount: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: [
        "open",
        "in-progress",
        "completed",
        "cancelled",
        "closed",
      ],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

const Gig = mongoose.model("Gig", gigSchema);

export default Gig;