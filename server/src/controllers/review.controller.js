import Review from "../models/Review.model.js";
import Contract from "../models/Contract.model.js";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { notifyAsync } from "../services/notification.service.js";

/**
 * Create Review
 * POST /api/reviews
 * Role: client
 */

/**
 * Get Freelancer Reviews
 * GET /api/reviews/freelancer/:freelancerId
 */
export const getFreelancerReviews = async (
  req,
  res,
  next
) => {
  try {
    const { freelancerId } = req.params;

    const reviews = await Review.find({
      freelancer: freelancerId,
    })
      .populate(
        "client",
        "fullName avatar"
      )
      .populate({
        path: "contract",
        populate: {
          path: "gig",
          select: "title",
        },
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get My Reviews
 * GET /api/reviews/my-reviews
 */
export const getMyReviews = async (
  req,
  res,
  next
) => {
  try {
    const reviews = await Review.find({
      client: req.user._id,
    })
      .populate(
        "freelancer",
        "fullName avatar averageRating"
      )
      .populate({
        path: "contract",
        populate: {
          path: "gig",
          select: "title",
        },
      })
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { contractId, rating, comment } = req.body;

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return next(
        new ApiError(404, "Contract not found.")
      );
    }

    if (
      contract.client.toString() !==
      req.user._id.toString()
    ) {
      return next(
        new ApiError(
          403,
          "Only the client can leave a review."
        )
      );
    }

    if (contract.status !== "completed") {
      return next(
        new ApiError(
          400,
          "You can only review completed contracts."
        )
      );
    }

    const existingReview =
      await Review.findOne({
        contract: contractId,
      });

    if (existingReview) {
      return next(
        new ApiError(
          400,
          "Review already exists for this contract."
        )
      );
    }

    const review = await Review.create({
      contract: contractId,
      client: req.user._id,
      freelancer: contract.freelancer,
      rating,
      comment,
    });

    /* Update Freelancer Rating */
    const freelancer =
      await User.findById(
        contract.freelancer
      );

    const stats =
      await Review.aggregate([
        {
          $match: {
            freelancer:
              contract.freelancer,
          },
        },
        {
          $group: {
            _id: "$freelancer",
            avgRating: {
              $avg: "$rating",
            },
            totalReviews: {
              $sum: 1,
            },
          },
        },
      ]);

    freelancer.totalReviews =
      stats[0]?.totalReviews || 0;

    freelancer.averageRating =
      Number(
        (
          stats[0]?.avgRating || 0
        ).toFixed(1)
      );

    await freelancer.save();

    await notifyAsync({
      user: contract.freelancer,
      type: "review_added",
      title:
        "You received a new review",
      message: `${req.user.fullName} rated you ${rating}★ on a completed project.`,
      link: "/freelancer/my-contracts",
      relatedId: review._id,
    });

    return res.status(201).json({
      success: true,
      message:
        "Review submitted successfully.",
      review,
    });
  } catch (error) {
    next(error);
  }
};