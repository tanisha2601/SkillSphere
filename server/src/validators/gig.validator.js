import { body, validationResult } from "express-validator";

/**
 * Create Gig Validation
 */
export const createGigValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Gig title is required.")
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ min: 20, max: 3000 })
    .withMessage("Description must be between 20 and 3000 characters."),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required."),

  body("subCategory")
    .optional()
    .trim(),

  body("budget")
    .notEmpty()
    .withMessage("Budget is required.")
    .isFloat({ min: 1 })
    .withMessage("Budget must be greater than 0."),

  body("deliveryTime")
    .notEmpty()
    .withMessage("Delivery time is required.")
    .isInt({ min: 1 })
    .withMessage("Delivery time must be at least 1 day."),

  body("skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array."),

  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array."),

  body("revisions")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Revisions cannot be negative."),
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