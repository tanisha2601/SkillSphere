import Contract from "../models/Contract.model.js";
import User from "../models/User.model.js";
import { notifyAsync } from "../services/notification.service.js";

/*
=========================================
GET MY CONTRACTS
=========================================
*/
export const getMyContracts = async (req, res) => {
  try {
    const contracts = await Contract.find({
      $or: [{ client: req.user._id }, { freelancer: req.user._id }],
    })
      .populate("gig", "title")
      .populate("client", "fullName email avatar")
      .populate("freelancer", "fullName email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      contracts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contracts",
      error: error.message,
    });
  }
};

/*
=========================================
GET SINGLE CONTRACT
=========================================
*/
export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("gig")
      .populate("client", "fullName email avatar")
      .populate("freelancer", "fullName email avatar");

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Only the client or freelancer on this contract can view it.
    const isParticipant =
      contract.client._id.toString() === req.user._id.toString() ||
      contract.freelancer._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this contract",
      });
    }

    res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contract",
      error: error.message,
    });
  }
};

/*
=========================================
UPDATE PROGRESS
(the two duplicate exports of this function were merged into one)
=========================================
*/
export const updateContractProgress = async (req, res) => {
  try {
    const { progress } = req.body;

    // Basic validation - progress must be a number between 0 and 100.
    const progressNum = Number(progress);
    if (Number.isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be a number between 0 and 100",
      });
    }

    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Only the assigned freelancer can update progress on the contract.
    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the freelancer on this contract can update progress",
      });
    }

    contract.progress = progressNum;

    if (progressNum === 0) {
      contract.status = "pending";
    } else if (progressNum < 100) {
      contract.status = "in-progress";
    } else {
      contract.status = "completed";
      contract.completionDate = new Date();
    }

    await contract.save();

    return res.status(200).json({
      success: true,
      contract,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update progress",
      error: error.message,
    });
  }
};

/*
=========================================
SUBMIT WORK
=========================================
*/
export const submitWork = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Only the assigned freelancer can submit work.
    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the freelancer on this contract can submit work",
      });
    }

    contract.workSubmitted = true;
    contract.submittedAt = new Date();
    contract.status = "submitted";

    await contract.save();

    // Notify client that work was submitted
    notifyAsync({
      user:    contract.client,
      type:    "system",
      title:   "Work Submitted",
      message: `Freelancer has submitted work for contract.`,
      link:    `/client/contract/${contract._id}`,
      relatedId: contract._id,
    });

    res.status(200).json({
      success: true,
      message: "Work submitted successfully",
      contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit work",
      error: error.message,
    });
  }
};

/*
=========================================
APPROVE CONTRACT
=========================================
*/
export const approveContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        message: "Contract not found",
      });
    }

    // Only the client can approve the contract.
    if (contract.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the client on this contract can approve it",
      });
    }

    contract.clientApproved = true;
    contract.approvedAt = new Date();
    contract.status = "completed";
    contract.progress = 100;

    await contract.save();

    /*
    Increase freelancer stats
    */
    await User.findByIdAndUpdate(contract.freelancer, {
      $inc: { completedProjects: 1 },
    });

    // Notify freelancer that work was approved
    notifyAsync({
      user:    contract.freelancer,
      type:    "proposal_accepted",
      title:   "Contract Approved!",
      message: `Client approved the contract. Payment will be released.`,
      link:    `/freelancer/contract/${contract._id}`,
      relatedId: contract._id,
    });

    res.status(200).json({
      success: true,
      message: "Contract completed",
      contract,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to approve contract",
      error: error.message,
    });
  }
};