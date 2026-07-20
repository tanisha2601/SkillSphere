import multer from "multer";
import path from "path";
import fs from "fs";

/* --------------------------------------------------------
   Reusable disk-storage factory
-------------------------------------------------------- */
const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        folder
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, fileName);
    },
  });

/* --------------------------------------------------------
   Avatar upload  (images only, 5 MB max)
-------------------------------------------------------- */
export const uploadAvatar = multer({
  storage: storage("avatars"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for avatars"));
    }
  },
});

/* --------------------------------------------------------
   Resume upload  (pdf / doc / docx, 10 MB max)
-------------------------------------------------------- */
export const uploadResume = multer({
  storage: storage("resumes"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Word documents are allowed for resumes"));
    }
  },
});

/* --------------------------------------------------------
   Portfolio image upload  (images only, 5 MB max)
-------------------------------------------------------- */
export const uploadPortfolioImage = multer({
  storage: storage("portfolio"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for portfolio images"));
    }
  },
});