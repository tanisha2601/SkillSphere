import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    googleId: {
      type: String,
      default: "",
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    role: {
      type: String,
      enum: ["client", "freelancer", "admin"],
      default: "client",
    },

    avatar: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },

    title: {
      type: String,
      default: "",
    },

   skills: [
  {
    name: String,
    level: {
      type: Number,
      default: 80,
    },
  },
],

    languages: [
      {
        type: String,
      },
    ],

    experience: {
      type: Number,
      default: 0,
    },

    education: {
      type: String,
      default: "",
    },

    portfolio: {
      type: String,
      default: "",
    },

    github: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    hourlyRate: {
      type: Number,
      default: 0,
    },

    completedProjects: {
      type: Number,
      default: 0,
    },

    totalEarnings: {
      type: Number,
      default: 0,
    },


    totalReviews: {
  type: Number,
  default: 0,
},

    walletBalance: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
    },



    reputationScore: {
      type: Number,
      default: 0,
    },

    badge: {
      type: String,
      enum: ["Beginner", "Rising Talent", "Top Freelancer"],
      default: "Beginner",
    },

    skillScore: {
      type: Number,
      default: 0,
    },

    profileCompletion: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isIdentityVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: "",
    },

    verificationTokenExpires: {
      type: Date,
    },

    resetPasswordToken: {
      type: String,
      default: "",
    },

    resetPasswordExpires: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "blocked"],
      default: "active",
    },


activity: [
  {
    text: String,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
],


    lastLogin: {
      type: Date,
    },

    resumeUrl: {
      type: String,
      default: "",
    },

   certifications: [
  {
    title: String,
    issuer: String,
    year: Number,

    credentialUrl: {
      type: String,
      default: "",
    },
  },
],


    reviews: [
  {
    clientName: String,

    clientAvatar: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 5,
    },

    feedback: String,

    projectName: String,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
],

notifications: [
  {
    message: String,

    type: {
      type: String,
      enum: [
        "proposal",
        "payment",
        "review",
        "message",
      ],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
],


workTimeline: [
  {
    title: String,
    company: String,
    year: Number,
    description: String,
  },
],


pricingPlans: {
  basic: {
    price: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: "",
    },
  },

  standard: {
    price: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: "",
    },
  },

  premium: {
    price: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: "",
    },
  },
},


analytics: {
  profileViews: {
    type: Number,
    default: 0,
  },

  proposalAcceptanceRate: {
    type: Number,
    default: 0,
  },

  clientRetentionRate: {
    type: Number,
    default: 0,
  },

  weeklyViews: [
    {
      type: Number,
    },
  ],
},

    portfolioLinks: [
      {
        title: String,
        url: String,
      },
    ],

    portfolioProjects: [
  {
    title: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    github: {
      type: String,
      default: "",
    },

    liveDemo: {
      type: String,
      default: "",
    },

    techStack: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["Live", "Development", "Completed"],
      default: "Development",
    },
  },
],

    availabilityStatus: {
      type: String,
      enum: ["Available", "Busy", "Unavailable"],
      default: "Available",
    },

    availableSlots: [
      {
        date: Date,
        startTime: String,
        endTime: String,
        booked: {
          type: Boolean,
          default: false,
        },
      },
    ],

    profileViews: {
      type: Number,
      default: 0,
    },

    applicationsSent: {
      type: Number,
      default: 0,
    },

    clientsWorkedWith: {
  type: Number,
  default: 0,
},

responseRate: {
  type: Number,
  default: 100,
},

repeatClients: {
  type: Number,
  default: 0,
},

  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Password Hash
|--------------------------------------------------------------------------
*/

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );

    next();
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| Compare Password
|--------------------------------------------------------------------------
*/

userSchema.methods.comparePassword = async function (
  candidatePassword
) {
  return bcrypt.compare(
    candidatePassword,
    this.password
  );
};

const User = mongoose.model(
  "User",
  userSchema
);

export default User;