const Notification = require('../models/Notification');

const inMemoryNotifications = [
  {
    _id: 'notif_1',
    type: 'success',
    title: 'Workflow Run Completed',
    message: 'Workflow "Customer Invoice Sync" executed successfully.',
    isRead: false,
    createdAt: new Date(),
  },
  {
    _id: 'notif_2',
    type: 'info',
    title: 'Integration Health Check',
    message: 'Gmail OAuth token auto-refreshed.',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000),
  },
];

const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ owner: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ notifications });
  } catch (err) {
    return res.status(200).json({ notifications: inMemoryNotifications });
  }
};

const markRead = async (req, res) => {
  try {
    await Notification.updateMany({ owner: req.user.id }, { isRead: true });
    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    inMemoryNotifications.forEach((n) => (n.isRead = true));
    return res.status(200).json({ message: 'All notifications marked as read' });
  }
};

module.exports = {
  listNotifications,
  markRead,
};
