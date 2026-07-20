import Gig from '../models/Gig.model.js';
import User from '../models/User.model.js';

/* ==========================================================
   CREATE GIG
========================================================== */

export const createGig = async (req, res) => {
  try {
    const { title, description, category, budget, skills, deliveryTime } = req.body;

    const gig = await Gig.create({
      title,
      description,
      category,
      budget,
      skills,
      deliveryTime,
      client: req.user._id,
      status: 'open',
    });

    return res.status(201).json({
      success: true,
      message: 'Gig created successfully',
      gig,
    });
  } catch (error) {
    console.error('Create Gig Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

/* ==========================================================
   GET ALL GIGS
========================================================== */

export const getAllGigs = async (req, res) => {
  try {
    const {
      search,
      category,
      skills,
      minBudget,
      maxBudget,
      status,
      sortBy,
      page = 1,
      limit = 10,
      deliveryTime,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = 'open';
    }

    // Search
    if (search?.trim()) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          description: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    // Category
    if (category?.trim()) {
      filter.category = {
        $regex: category,
        $options: 'i',
      };
    }

    // Skills
    if (skills?.trim()) {
      const skillsArray = skills.split(',').map((s) => s.trim());

      filter.skills = {
        $in: skillsArray,
      };
    }

    // Budget
    if (minBudget || maxBudget) {
      filter.budget = {};

      if (minBudget) {
        filter.budget.$gte = Number(minBudget);
      }

      if (maxBudget) {
        filter.budget.$lte = Number(maxBudget);
      }
    }

    // Delivery Time
    if (deliveryTime) {
      filter.deliveryTime = {
        $lte: Number(deliveryTime),
      };
    }

    // Sorting
    let sort = {
      createdAt: -1,
    };

    switch (sortBy) {
      case 'oldest':
        sort = {
          createdAt: 1,
        };
        break;

      case 'budget_asc':
        sort = {
          budget: 1,
        };
        break;

      case 'budget_desc':
        sort = {
          budget: -1,
        };
        break;

      case 'delivery':
        sort = {
          deliveryTime: 1,
        };
        break;

      default:
        sort = {
          createdAt: -1,
        };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const total = await Gig.countDocuments(filter);

    const gigs = await Gig.find(filter)
      .populate('client', 'fullName email avatar')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      currentPage: Number(page),

      totalPages: Math.ceil(total / Number(limit)),

      total,

      count: gigs.length,

      gigs,
    });
  } catch (error) {
    console.error('Get Gigs Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// ==========================
// Get Single Gig
// ==========================
export const getSingleGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('client', 'fullName email');

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    return res.status(200).json({
      success: true,
      gig,
    });
  } catch (error) {
    console.error('Get Single Gig Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// ==========================
// Update Gig (Owner Only)
// ==========================
export const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    // Ownership check
    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this gig',
      });
    }

    const { title, description, category, budget, skills, deliveryTime, status } = req.body;

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.id,
      { title, description, category, budget, skills, deliveryTime, status },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Gig updated successfully',
      gig: updatedGig,
    });
  } catch (error) {
    console.error('Update Gig Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// ==========================
// Delete Gig (Owner Only)
// ==========================
export const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig not found',
      });
    }

    // Ownership check
    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this gig',
      });
    }

    await gig.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Gig deleted successfully',
    });
  } catch (error) {
    console.error('Delete Gig Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// ==========================
// Recommended Gigs
// ==========================
export const getRecommendedGigs = async (req, res) => {
  try {
    console.log("USER:", req.user);
    const profile = await User.findById(req.user._id);
    console.log("PROFILE:", profile);

    const skills = profile?.skills || [];
    console.log("SKILLS:", skills);

    // If no profile or no skills, fallback to latest gigs
    if (!profile || skills.length === 0) {
      const fallbackGigs = await Gig.find({ status: 'open' })
        .populate('client', 'fullName')
        .sort({ createdAt: -1 })
        .limit(6);

      return res.status(200).json({
        success: true,
        gigs: fallbackGigs,
      });
    }

    const gigs = await Gig.find({ status: 'open' }).populate('client', 'fullName');

    const recommended = gigs
      .map((gig) => {
        let score = 0;

        skills.forEach((skill) => {
          const skillName = typeof skill === 'string' ? skill : skill.name || '';
          const s = skillName.toLowerCase();
          
          if (!s) return;

          if (gig.title?.toLowerCase().includes(s.replace('.js', ''))) {
            score += 5;
          }

          if (gig.description?.toLowerCase().includes(s.replace('.js', ''))) {
            score += 3;
          }
          if (gig.skills?.some((g) => {
            const gigSkillName = typeof g === 'string' ? g : g.name || '';
            return gigSkillName.toLowerCase().includes(s) || s.includes(gigSkillName.toLowerCase());
          })) {
            score += 10;
          }
        });

        return {
          ...gig.toObject(),
          matchScore: score,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    return res.status(200).json({
      success: true,
      gigs: recommended,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message,
      stack: error.stack
    });
  }
};

// ==========================
// Get My Gigs (client's own — any status)
// ==========================
export const getMyGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ client: req.user._id })
      .populate('client', 'fullName email avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: gigs.length,
      gigs,
    });
  } catch (error) {
    console.error('Get My Gigs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};