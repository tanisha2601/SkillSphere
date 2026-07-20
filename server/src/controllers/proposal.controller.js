import Proposal from "../models/Proposal.model.js";
import Gig from "../models/Gig.model.js";
import Contract from "../models/Contract.model.js";
import ApiError from "../utils/ApiError.js";
import { notifyAsync } from "../services/notification.service.js";

/**
 * Create Proposal
 * POST /api/proposals/:gigId
 * Role: freelancer
 */
export const createProposal = async (req, res, next) => {
  try {
    const { coverLetter, proposedBudget, deliveryTime } = req.body;
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);

    if (!gig) {
      return next(new ApiError(404, "Gig not found."));
    }

    if (gig.status !== "open") {
      return next(
        new ApiError(400, "This gig is no longer accepting proposals.")
      );
    }

    if (gig.client.toString() === req.user._id.toString()) {
      return next(new ApiError(400, "You cannot apply to your own gig."));
    }

    const existingProposal = await Proposal.findOne({
      gig: gigId,
      freelancer: req.user._id,
    });

    if (existingProposal) {
      return next(
        new ApiError(400, "You have already submitted a proposal for this gig.")
      );
    }

    const proposal = await Proposal.create({
      gig: gigId,
      freelancer: req.user._id,
      coverLetter,
      proposedBudget,
      deliveryTime,
    });

    gig.proposalsCount += 1;
    await gig.save();

    notifyAsync({
      user: gig.client,
      type: "new_proposal",
      title: "New proposal received",
      message: `${req.user.fullName} submitted a proposal on "${gig.title}"`,
      link: `/client/proposals/${gig._id}`,
      relatedId: proposal._id,
    });

    res.status(201).json({
      success: true,
      message: "Proposal submitted successfully.",
      proposal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Freelancer's Own Proposals
 * GET /api/proposals/my-proposals
 * Role: freelancer
 */
export const getMyProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({
      freelancer: req.user._id,
    })
      .populate("gig", "title budget deliveryTime status category client")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Client View Proposals for a Gig
 * GET /api/proposals/gig/:gigId
 * Role: client, admin
 */
export const getGigProposals = async (req, res, next) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);

    if (!gig) {
      return next(new ApiError(404, "Gig not found."));
    }

    if (gig.client.toString() !== req.user._id.toString()) {
      return next(
        new ApiError(403, "You are not authorized to view these proposals.")
      );
    }

    const proposals = await Proposal.find({
      gig: gigId,
    })
      .populate(
        "freelancer",
        "fullName email avatar title skills averageRating totalReviews"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept Proposal – auto-creates contract
 * PATCH /api/proposals/accept/:id
 * Role: client
 */
export const acceptProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return next(new ApiError(404, "Proposal not found."));
    }

    const gig = await Gig.findById(proposal.gig);

    if (!gig) {
      return next(new ApiError(404, "Gig not found."));
    }

    if (gig.client.toString() !== req.user._id.toString()) {
      return next(
        new ApiError(403, "You are not authorized to accept this proposal.")
      );
    }

    if (proposal.status !== "pending") {
      return next(
        new ApiError(400, "Only pending proposals can be accepted.")
      );
    }

    if (gig.assignedFreelancer) {
      return next(
        new ApiError(
          400,
          "A freelancer has already been assigned to this gig."
        )
      );
    }

    // Prevent duplicate contracts
    const existingContract = await Contract.findOne({
      gig: gig._id,
      proposal: proposal._id,
    });

    if (existingContract) {
      return next(
        new ApiError(400, "A contract already exists for this proposal.")
      );
    }

    // Accept this proposal
    proposal.status = "accepted";
    await proposal.save();

    // Reject all other pending proposals for this gig
    await Proposal.updateMany(
      {
        gig: proposal.gig,
        _id: { $ne: proposal._id },
        status: "pending",
      },
      {
        status: "rejected",
      }
    );

    // Update gig
    gig.assignedFreelancer = proposal.freelancer;
    gig.status = "in-progress";
    await gig.save();

    // Create contract
    const contract = await Contract.create({
      gig: gig._id,
      client: gig.client,
      freelancer: proposal.freelancer,
      proposal: proposal._id,
      agreedBudget: proposal.proposedBudget,
      deliveryTime: proposal.deliveryTime,
      paymentStatus: "unpaid",
    });

    notifyAsync({
      user: proposal.freelancer,
      type: "proposal_accepted",
      title: "Your proposal was accepted!",
      message: `Your proposal on "${gig.title}" was accepted. A contract has been created.`,
      link: `/freelancer/contract/${contract._id}`,
      relatedId: contract._id,
    });

    res.status(200).json({
      success: true,
      message: "Proposal accepted and contract created.",
      proposal,
      contract,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject Proposal
 * PATCH /api/proposals/reject/:id
 * Role: client
 */
export const rejectProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return next(new ApiError(404, "Proposal not found."));
    }

    const gig = await Gig.findById(proposal.gig);

    if (!gig) {
      return next(new ApiError(404, "Gig not found."));
    }

    if (gig.client.toString() !== req.user._id.toString()) {
      return next(
        new ApiError(
          403,
          "You are not authorized to reject this proposal."
        )
      );
    }

    if (proposal.status !== "pending") {
      return next(
        new ApiError(400, "Only pending proposals can be rejected.")
      );
    }

    proposal.status = "rejected";
    await proposal.save();

    notifyAsync({
      user: proposal.freelancer,
      type: "proposal_rejected",
      title: "Proposal update",
      message: `Your proposal on "${gig.title}" was not selected this time.`,
      link: `/freelancer/my-proposals`,
      relatedId: proposal._id,
    });

    res.status(200).json({
      success: true,
      message: "Proposal rejected successfully.",
      proposal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Withdraw Proposal
 * PATCH /api/proposals/withdraw/:id
 * Role: freelancer
 */
export const withdrawProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return next(new ApiError(404, "Proposal not found."));
    }

    if (proposal.freelancer.toString() !== req.user._id.toString()) {
      return next(
        new ApiError(
          403,
          "You are not authorized to withdraw this proposal."
        )
      );
    }

    if (proposal.status !== "pending") {
      return next(
        new ApiError(400, "Only pending proposals can be withdrawn.")
      );
    }

    proposal.status = "withdrawn";
    await proposal.save();

    await Gig.findByIdAndUpdate(proposal.gig, {
      $inc: {
        proposalsCount: -1,
      },
    });

    res.status(200).json({
      success: true,
      message: "Proposal withdrawn successfully.",
      proposal,
    });
  } catch (error) {
    next(error);
  }
};