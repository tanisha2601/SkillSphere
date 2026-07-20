import { body, validationResult } from "express-validator";

/**
 * Proposal Validation
 */
export const createProposalValidation = [
  body("coverLetter")
    .trim()
    .notEmpty()
    .withMessage("Cover letter is required.")
    .isLength({ min: 30, max: 2000 })
    .withMessage("Cover letter must be between 30 and 2000 characters."),

  body("proposedBudget")
    .notEmpty()
    .withMessage("Proposed budget is required.")
    .isFloat({ min: 1 })
    .withMessage("Budget must be greater than 0."),

  body("deliveryTime")
    .notEmpty()
    .withMessage("Delivery time is required.")
    .isInt({ min: 1 })
    .withMessage("Delivery time must be at least 1 day."),
];

/**
 * Validation Middleware
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array(),
    });
  }

  next();
};