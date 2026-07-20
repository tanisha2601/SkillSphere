import User from "../models/User.model.js";

/**
 * Sanitize a URL string:
 * - Trims whitespace
 * - If multiple https?:// segments exist (concatenation bug), takes the LAST one
 * - Prepends https:// if no protocol present
 * - Returns empty string for falsy input
 */
const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/(?=https?:\/\/)/i).filter(Boolean);
  const best = parts.length > 1 ? parts[parts.length - 1].trim() : trimmed;
  return /^https?:\/\//i.test(best) ? best : `https://${best}`;
};

/* ==========================================================
   GET PROFILE
========================================================== */

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch profile", error: err.message });
  }
};

/* ==========================================================
   UPLOAD AVATAR
========================================================== */

export const uploadAvatarHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    return res.status(200).json({ success: true, avatar: avatarUrl, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Avatar upload failed", error: error.message });
  }
};

/* ==========================================================
   UPLOAD RESUME
========================================================== */

export const uploadResumeHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeUrl },
      { new: true }
    ).select("-password");

    return res.status(200).json({ success: true, resumeUrl, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Resume upload failed", error: err.message });
  }
};

/* ==========================================================
   UPDATE PROFILE  (full document patch)
========================================================== */

export const updateProfile = async (req, res) => {
  try {
    const {
      fullName, title, bio, skills, languages, experience,
      education, portfolio, github, linkedin, website, hourlyRate,
      phone, location, resumeUrl, availabilityStatus, certifications,
      portfolioLinks, portfolioProjects, reviews, notifications,
      workTimeline, pricingPlans, analytics, clientsWorkedWith,
      responseRate, repeatClients,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.fullName           = fullName           ?? user.fullName;
    user.title              = title              ?? user.title;
    user.bio                = bio                ?? user.bio;
    // Strip any skills with missing/empty name before saving
    user.skills = Array.isArray(skills)
      ? skills.filter(s => s && typeof s.name === 'string' && s.name.trim().length > 0)
      : user.skills;
    user.languages          = Array.isArray(languages)   ? languages   : user.languages;
    user.experience         = experience  !== undefined  ? Number(experience)  : user.experience;
    user.education          = education          ?? user.education;
    user.portfolio          = portfolio          ?? user.portfolio;
    user.github             = github   !== undefined ? sanitizeUrl(github)   : user.github;
    user.linkedin           = linkedin !== undefined ? sanitizeUrl(linkedin)  : user.linkedin;
    user.website            = website  !== undefined ? sanitizeUrl(website)   : user.website;
    user.hourlyRate         = hourlyRate !== undefined ? Number(hourlyRate) : user.hourlyRate;
    user.phone              = phone              ?? user.phone;
    user.location           = location           ?? user.location;
    user.resumeUrl          = resumeUrl          ?? user.resumeUrl;
    user.availabilityStatus = availabilityStatus ?? user.availabilityStatus;
    user.certifications     = certifications     ?? user.certifications;
    user.portfolioLinks     = portfolioLinks     ?? user.portfolioLinks;
    user.portfolioProjects  = portfolioProjects  ?? user.portfolioProjects;
    user.reviews            = reviews            ?? user.reviews;
    user.notifications      = notifications      ?? user.notifications;
    user.workTimeline       = workTimeline       ?? user.workTimeline;
    user.pricingPlans       = pricingPlans       ?? user.pricingPlans;
    user.analytics          = analytics          ?? user.analytics;
    user.clientsWorkedWith  = clientsWorkedWith  ?? user.clientsWorkedWith;
    user.responseRate       = responseRate       ?? user.responseRate;
    user.repeatClients      = repeatClients      ?? user.repeatClients;

    // Profile Completion
    const fields = [
      user.fullName, user.title, user.bio, user.skills?.length,
      user.languages?.length, user.github, user.linkedin, user.portfolio,
      user.resumeUrl, user.education, user.location, user.phone,
      user.portfolioProjects?.length, user.certifications?.length, user.workTimeline?.length,
    ];
    user.profileCompletion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      completion: user.profileCompletion,
      user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update profile", error: err.message });
  }
};

/* ==========================================================
   PROFILE STATS
========================================================== */

export const getProfileStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const fields = [
      user.fullName, user.title, user.bio, user.skills?.length,
      user.languages?.length, user.github, user.linkedin, user.portfolio,
      user.resumeUrl, user.education, user.location, user.phone,
      user.portfolioProjects?.length, user.certifications?.length, user.workTimeline?.length,
    ];
    const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

    return res.status(200).json({
      success: true,
      completion:          user.profileCompletion ?? completion,
      profileViews:        user.profileViews,
      applicationsSent:    user.applicationsSent,
      completedProjects:   user.completedProjects,
      totalReviews:        user.totalReviews,
      clientsWorkedWith:   user.clientsWorkedWith,
      responseRate:        user.responseRate,
      repeatClients:       user.repeatClients,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch profile stats", error: err.message });
  }
};

/* ==========================================================
   PORTFOLIO PROJECT  — granular CRUD
========================================================== */

// POST /api/users/profile/portfolio
export const addPortfolioProject = async (req, res) => {
  try {
    const { title, description, techStack, github, liveDemo, status, image } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          portfolioProjects: { title, description, techStack, github, liveDemo, status, image },
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    await _recalcCompletion(user);

    return res.status(201).json({ success: true, message: "Project added", portfolioProjects: user.portfolioProjects });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to add project", error: err.message });
  }
};

// PUT /api/users/profile/portfolio/:projectId
export const updatePortfolioProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, techStack, github, liveDemo, status, image } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, "portfolioProjects._id": projectId },
      {
        $set: {
          "portfolioProjects.$.title":       title,
          "portfolioProjects.$.description": description,
          "portfolioProjects.$.techStack":   techStack,
          "portfolioProjects.$.github":      github,
          "portfolioProjects.$.liveDemo":    liveDemo,
          "portfolioProjects.$.status":      status,
          "portfolioProjects.$.image":       image,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({ success: true, message: "Project updated", portfolioProjects: user.portfolioProjects });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update project", error: err.message });
  }
};

// DELETE /api/users/profile/portfolio/:projectId
export const deletePortfolioProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { portfolioProjects: { _id: projectId } } },
      { new: true }
    ).select("-password");

    await _recalcCompletion(user);

    return res.status(200).json({ success: true, message: "Project deleted", portfolioProjects: user.portfolioProjects });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete project", error: err.message });
  }
};

/* ==========================================================
   CERTIFICATIONS  — granular CRUD
========================================================== */

// POST /api/users/profile/certifications
export const addCertification = async (req, res) => {
  try {
    const { title, issuer, year, credentialUrl } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Certification title is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { certifications: { title, issuer, year: year ? Number(year) : undefined, credentialUrl } } },
      { new: true }
    ).select("-password");

    await _recalcCompletion(user);

    return res.status(201).json({ success: true, message: "Certification added", certifications: user.certifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to add certification", error: err.message });
  }
};

// PUT /api/users/profile/certifications/:certId
export const updateCertification = async (req, res) => {
  try {
    const { certId } = req.params;
    const { title, issuer, year, credentialUrl } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, "certifications._id": certId },
      {
        $set: {
          "certifications.$.title":         title,
          "certifications.$.issuer":        issuer,
          "certifications.$.year":          year ? Number(year) : undefined,
          "certifications.$.credentialUrl": credentialUrl,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "Certification not found" });
    }

    return res.status(200).json({ success: true, message: "Certification updated", certifications: user.certifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update certification", error: err.message });
  }
};

// DELETE /api/users/profile/certifications/:certId
export const deleteCertification = async (req, res) => {
  try {
    const { certId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { certifications: { _id: certId } } },
      { new: true }
    ).select("-password");

    await _recalcCompletion(user);

    return res.status(200).json({ success: true, message: "Certification deleted", certifications: user.certifications });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete certification", error: err.message });
  }
};

/* ==========================================================
   WORK EXPERIENCE (workTimeline)  — granular CRUD
========================================================== */

// POST /api/users/profile/work-experience
export const addWorkExperience = async (req, res) => {
  try {
    const { title, company, year, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Job title is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { workTimeline: { title, company, year: year ? Number(year) : undefined, description } } },
      { new: true }
    ).select("-password");

    await _recalcCompletion(user);

    return res.status(201).json({ success: true, message: "Work experience added", workTimeline: user.workTimeline });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to add work experience", error: err.message });
  }
};

// PUT /api/users/profile/work-experience/:itemId
export const updateWorkExperience = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { title, company, year, description } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, "workTimeline._id": itemId },
      {
        $set: {
          "workTimeline.$.title":       title,
          "workTimeline.$.company":     company,
          "workTimeline.$.year":        year ? Number(year) : undefined,
          "workTimeline.$.description": description,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "Work experience not found" });
    }

    return res.status(200).json({ success: true, message: "Work experience updated", workTimeline: user.workTimeline });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update work experience", error: err.message });
  }
};

// DELETE /api/users/profile/work-experience/:itemId
export const deleteWorkExperience = async (req, res) => {
  try {
    const { itemId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { workTimeline: { _id: itemId } } },
      { new: true }
    ).select("-password");

    await _recalcCompletion(user);

    return res.status(200).json({ success: true, message: "Work experience deleted", workTimeline: user.workTimeline });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete work experience", error: err.message });
  }
};

/* ==========================================================
   ACTIVITY FEED
========================================================== */

// GET /api/users/profile/activity
export const getActivityFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("activity");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const activity = [...(user.activity || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json({ success: true, activity });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch activity", error: err.message });
  }
};

// POST /api/users/profile/activity
export const addActivityEntry = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "Activity text is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { activity: { $each: [{ text }], $position: 0, $slice: 50 } } },
      { new: true }
    ).select("activity");

    return res.status(201).json({ success: true, activity: user.activity });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to add activity", error: err.message });
  }
};

/* ==========================================================
   ANALYTICS  — increment profile views
========================================================== */

// POST /api/users/profile/view  (called when another user visits the profile)
export const incrementProfileView = async (req, res) => {
  try {
    // Only count views from other users, not the owner
    const targetUserId = req.params.userId || req.user._id;

    await User.findByIdAndUpdate(targetUserId, {
      $inc: {
        profileViews: 1,
        "analytics.profileViews": 1,
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to track view", error: err.message });
  }
};

/* ==========================================================
   PRIVATE HELPERS
========================================================== */

async function _recalcCompletion(user) {
  if (!user) return;
  const fields = [
    user.fullName, user.title, user.bio, user.skills?.length,
    user.languages?.length, user.github, user.linkedin, user.portfolio,
    user.resumeUrl, user.education, user.location, user.phone,
    user.portfolioProjects?.length, user.certifications?.length, user.workTimeline?.length,
  ];
  user.profileCompletion = Math.round((fields.filter(Boolean).length / fields.length) * 100);
  await user.save();
}