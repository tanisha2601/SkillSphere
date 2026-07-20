import Notification from "../models/Notification.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// GET /api/notifications
export const getMyNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find({
        user: req.user._id,
      }).lean()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments({ user: req.user._id, isRead: false }),
      Notification.countDocuments({ user: req.user._id }),
    ]);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { notifications, unreadCount, total, page, limit },
          "Notifications fetched successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return next(new ApiError(404, "Notification not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, notification, "Marked as read"));
  } catch (error) {
    next(error);
  }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, null, "All notifications marked as read"));
  } catch (error) {
    next(error);
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return next(new ApiError(404, "Notification not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Notification deleted"));
  } catch (error) {
    next(error);
  }
};





export const deleteAllNotifications =
  async (req, res, next) => {
    try {
      await Notification.deleteMany({
        user: req.user._id,
      });


    


      return res.status(200).json(
        new ApiResponse(
          200,
          null,
          "All notifications deleted"
        )
      );
    } catch (err) {
      next(err);
    }
  };
