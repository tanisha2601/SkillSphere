import Razorpay from "razorpay";
import crypto from "crypto";

import Payment from "../models/Payment.model.js";
import Contract from "../models/Contract.model.js";
import Transaction from "../models/Transaction.model.js";
import User from "../models/User.model.js";

import ApiError from "../utils/ApiError.js";
import { notifyAsync } from "../services/notification.service.js";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_secret",
});

/* ==========================================================
   CREATE ORDER
========================================================== */

export const createOrder = async (req, res, next) => {
  try {
    const { contractId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return next(new ApiError(401, "Not authenticated."));
    }

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return next(new ApiError(404, "Contract not found."));
    }

    if (contract.client?.toString() !== userId.toString()) {
      return next(new ApiError(403, "Unauthorized."));
    }

    if (contract.paymentStatus === "paid") {
      return next(new ApiError(400, "Contract already funded."));
    }

    const existingPayment = await Payment.findOne({
      contract: contractId,
      status: "paid",
    });

    if (existingPayment) {
      return next(new ApiError(400, "Payment already completed."));
    }

    const order = await razorpayInstance.orders.create({
      amount: (contract.agreedBudget || 0) * 100,
      currency: "INR",
      receipt: `contract_${contract._id}`,
    });

    const payment = await Payment.create({
      contract: contract._id,
      client: contract.client,
      freelancer: contract.freelancer,
      amount: contract.agreedBudget,
      razorpayOrderId: order.id,
      status: "pending",
    });

    return res.status(200).json({
      success: true,
      order,
      payment,
    });
  } catch (err) {
    next(err);
  }
};

/* ==========================================================
   VERIFY PAYMENT
========================================================== */

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    if (!payment) {
      return next(new ApiError(404, "Payment not found."));
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "dummy_secret")
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();
      return next(new ApiError(400, "Payment verification failed."));
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    await Contract.findByIdAndUpdate(payment.contract, { paymentStatus: "paid" });

    const existingTxn = await Transaction.findOne({
      reference: payment.contract,
      type: "credit",
    });

    if (!existingTxn) {
      await Transaction.create({
        user: payment.freelancer,
        type: "credit",
        amount: payment.amount,
        reference: payment.contract,
        description: "Contract funded by client",
      });

      await User.findByIdAndUpdate(payment.freelancer, {
        $inc: {
          walletBalance: payment.amount,
          totalEarnings: payment.amount,
        },
      });
    }

    await notifyAsync({
      user: payment.freelancer,
      type: "payment_received",
      title: "Payment Received",
      message: `Client funded $${payment.amount}`,
      link: `/freelancer/contract/${payment.contract}`,
      relatedId: payment.contract,
    }).catch((notifyErr) => {
      console.error("notifyAsync failed:", notifyErr?.message);
    });

    return res.status(200).json({
      success: true,
      message: "Payment successful",
    });
  } catch (err) {
    next(err);
  }
};

/* ==========================================================
   WALLET — hardened, always returns a safe shape
========================================================== */

export const getWallet = async (req, res, next) => {
  const safeDefault = {
    success: true,
    balance: 0,
    totalEarnings: 0,
    transactions: [],
  };

  try {
    const userId = req.user?._id;

    // Not authenticated / no user on request -> don't crash, return empty wallet
    if (!userId) {
      return res.status(200).json(safeDefault);
    }

    const user = await User.findById(userId).lean().catch(() => null);

    // User record missing (deleted) -> still respond gracefully
    if (!user) {
      return res.status(200).json(safeDefault);
    }

    let transactions = [];
    try {
      transactions = await Transaction.find({ user: userId })
        .populate({
          path: "reference",
          model: "Contract", // explicit, don't rely only on schema ref
          populate: {
            path: "gig",
            select: "title",
          },
        })
        .sort({ createdAt: -1 })
        .lean();
    } catch (populateErr) {
      // Deleted contract/gig or bad ref shouldn't kill the whole request
      console.error("Wallet transaction populate failed:", populateErr?.message);
      transactions = await Transaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .lean()
        .catch(() => []);
    }

    return res.status(200).json({
      success: true,
      balance: user?.walletBalance ?? 0,
      totalEarnings: user?.totalEarnings ?? 0,
      transactions: Array.isArray(transactions) ? transactions : [],
    });
  } catch (err) {
    console.error("getWallet crashed, returning safe default:", err?.message);
    return res.status(200).json(safeDefault);
  }
};

/* ==========================================================
   PAYMENT HISTORY
========================================================== */

export const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(200).json({ success: true, payments: [] });
    }

    const payments = await Payment.find({ client: userId })
      .populate({
        path: "contract",
        populate: [
          { path: "gig", select: "title" },
          { path: "freelancer", select: "fullName email" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean()
      .catch(() => []);

    return res.status(200).json({
      success: true,
      payments: Array.isArray(payments) ? payments : [],
    });
  } catch (err) {
    console.error("getPaymentHistory crashed, returning safe default:", err?.message);
    return res.status(200).json({ success: true, payments: [] });
  }
};

/* ==========================================================
   MOCK PAYMENT
========================================================== */

export const mockPayment = async (req, res, next) => {
  try {
    const { contractId } = req.body;

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return next(new ApiError(404, "Contract not found."));
    }

    const existingPayment = await Payment.findOne({
      contract: contractId,
      status: "paid",
    });

    if (existingPayment) {
      return next(new ApiError(400, "Payment already completed."));
    }

    contract.paymentStatus = "paid";
    await contract.save();

    await Payment.create({
      contract: contract._id,
      client: contract.client,
      freelancer: contract.freelancer,
      amount: contract.agreedBudget,
      status: "paid",
      razorpayOrderId: `mock_order_${Date.now()}`,
      razorpayPaymentId: `mock_payment_${Date.now()}`,
      razorpaySignature: "mock_signature",
    });

    await Transaction.create({
      user: contract.freelancer,
      type: "credit",
      amount: contract.agreedBudget,
      reference: contract._id,
      description: "Mock contract funding",
    });

    await User.findByIdAndUpdate(contract.freelancer, {
      $inc: {
        walletBalance: contract.agreedBudget,
        totalEarnings: contract.agreedBudget,
      },
    });

    await notifyAsync({
      user: contract.freelancer,
      type: "payment_received",
      title: "Payment Received",
      message: `Client funded $${contract.agreedBudget}`,
      link: `/freelancer/contract/${contract._id}`,
      relatedId: contract._id,
    }).catch((notifyErr) => {
      console.error("notifyAsync failed:", notifyErr?.message);
    });

    return res.status(200).json({
      success: true,
      message: "Mock payment successful.",
    });
  } catch (err) {
    next(err);
  }
};