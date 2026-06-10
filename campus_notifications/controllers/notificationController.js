import Notification from '../models/Notification.js';

export const createNotification = async (req, res, next) => {
  try {
    const { title, description, category, targetDepartment, createdBy, priority } = req.body;

    const notification = new Notification({
      title,
      description,
      category,
      targetDepartment,
      createdBy,
      priority
    });

    const savedNotification = await notification.save();
    res.status(201).json({ success: true, data: savedNotification });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const { dept, category, priority, page = 1, limit = 20 } = req.query;
    const query = {};

    if (dept) {
      query.targetDepartment = { $in: [dept, 'All'] };
    }

    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    const pageNumber = Math.max(Number(page), 1);
    const pageSize = Math.min(Math.max(Number(limit), 1), 100);
    const skip = (pageNumber - 1) * pageSize;

    const [notifications, totalCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Notification.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total: totalCount,
      page: pageNumber,
      limit: pageSize,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await notification.deleteOne();
    res.status(200).json({ success: true, message: 'Notification removed successfully' });
  } catch (error) {
    next(error);
  }
};
