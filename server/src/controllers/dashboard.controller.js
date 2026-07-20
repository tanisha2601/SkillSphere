import Gig from "../models/Gig.model.js";
import Proposal from "../models/Proposal.model.js";
import Contract from "../models/Contract.model.js";
import Payment from "../models/Payment.model.js";
import Review from "../models/Review.model.js";

export const getClientDashboard = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user._id;

    const totalGigs =
      await Gig.countDocuments({
        client: userId,
      });

    const activeContracts =
      await Contract.countDocuments({
        client: userId,
        status: {
          $in: ["active", "submitted"],
        },
      });

    const spending =
      await Payment.aggregate([
        {
          $match: {
            client: userId,
            status: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

    const myGigIds =
      await Gig.find({
        client: userId,
      }).distinct("_id");

    const pendingProposals =
      await Proposal.countDocuments({
        gig: {
          $in: myGigIds,
        },
        status: "pending",
      });

    res.status(200).json({
      success: true,
      stats: {
        totalGigs,
        activeContracts,
        totalSpent:
          spending[0]?.total || 0,
        pendingProposals,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getFreelancerDashboard =
  async (req, res, next) => {
    try {
      const userId = req.user._id;

      const totalProposals =
        await Proposal.countDocuments({
          freelancer: userId,
        });

      const activeContracts =
        await Contract.countDocuments({
          freelancer: userId,
          status: {
            $in: ["active", "submitted"],
          },
        });

      const earnings =
        await Payment.aggregate([
          {
            $match: {
              freelancer: userId,
              status: "paid",
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: "$amount",
              },
            },
          },
        ]);

      const reviews =
        await Review.countDocuments({
          freelancer: userId,
        });

      res.status(200).json({
        success: true,
        stats: {
          totalProposals,
          activeContracts,
          earnings:
            earnings[0]?.total || 0,
          reviews,
        },
      });
    } catch (err) {
      next(err);
    }
  };