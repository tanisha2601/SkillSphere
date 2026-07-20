import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.model.js";
import { generateToken } from "../utils/jwt.js";

/*
|--------------------------------------------------------------------------
| REGISTER
|--------------------------------------------------------------------------
*/

export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
    } = req.body;

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "Email already registered",
      });
    }

    const verificationToken =
      crypto.randomBytes(32).toString(
        "hex"
      );

    const user = await User.create({
      fullName,
      email,
      password,
      role: role || "client",

      verificationToken,

      verificationTokenExpires:
        Date.now() +
        24 * 60 * 60 * 1000,
    });

    const token = generateToken(
      user._id
    );

    const userResponse =
      user.toObject();

    delete userResponse.password;

    res.status(201).json({
      success: true,
      message:
        "Registration successful",

      token,
      user: userResponse,

      verificationToken,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/

export const loginUser = async (
  req,
  res
) => {
  try {
    const { email, password } =
      req.body;

    const user =
      await User.findOne({
        email,
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    if (
      user.authProvider ===
      "google"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Login using Google",
      });
    }

    const isMatch =
      await user.comparePassword(
        password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials",
      });
    }

    user.lastLogin = new Date();

    await user.save();

    const token =
      generateToken(user._id);

    const userResponse =
      user.toObject();

    delete userResponse.password;

    res.status(200).json({
      success: true,
      message:
        "Login successful",

      token,
      user: userResponse,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message:
        "Internal Server Error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GOOGLE LOGIN
|--------------------------------------------------------------------------
*/

export const googleLogin =
  async (req, res) => {
    try {
      const {
        fullName,
        email,
        avatar,
        googleId,
      } = req.body;

      let user =
        await User.findOne({
          email,
        });

      if (!user) {
        user =
          await User.create({
            fullName,
            email,
            avatar,
            googleId,

            authProvider:
              "google",

            isVerified: true,
          });
      }

      const token =
        generateToken(
          user._id
        );

      res.status(200).json({
        success: true,
        token,
        user,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Google login failed",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD
|--------------------------------------------------------------------------
*/

export const forgotPassword =
  async (req, res) => {
    try {
      const { email } =
        req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const resetToken =
        crypto
          .randomBytes(32)
          .toString("hex");

      user.resetPasswordToken =
        resetToken;

      user.resetPasswordExpires =
        Date.now() +
        60 * 60 * 1000;

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Reset token generated",

        resetToken,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| RESET PASSWORD
|--------------------------------------------------------------------------
*/

export const resetPassword =
  async (req, res) => {
    try {
      const { token } =
        req.params;

      const { password } =
        req.body;

      const user =
        await User.findOne({
          resetPasswordToken:
            token,

          resetPasswordExpires: {
            $gt: Date.now(),
          },
        }).select("+password");

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "Token expired",
        });
      }

      user.password =
        password;

      user.resetPasswordToken =
        "";

      user.resetPasswordExpires =
        null;

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Password updated",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| VERIFY EMAIL
|--------------------------------------------------------------------------
*/

export const verifyEmail =
  async (req, res) => {
    try {
      const { token } =
        req.params;

      const user =
        await User.findOne({
          verificationToken:
            token,

          verificationTokenExpires:
            {
              $gt:
                Date.now(),
            },
        });

      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid token",
        });
      }

      user.isVerified = true;

      user.verificationToken =
        "";

      user.verificationTokenExpires =
        null;

      await user.save();

      res.status(200).json({
        success: true,
        message:
          "Email verified",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message:
          "Internal Server Error",
      });
    }
  };

/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

export const getCurrentUser =
  async (req, res) => {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  };

/*
|--------------------------------------------------------------------------
| LOGOUT
|--------------------------------------------------------------------------
*/

export const logoutUser =
  async (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Logout successful",
    });
  };