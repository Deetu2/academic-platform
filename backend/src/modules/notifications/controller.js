import prisma from '../../utils/db.js';
import { catchAsync, AppError } from '../../utils/errors.js';

export const getMyNotifications = catchAsync(async (req, res) => {
  const { limit = 50, unreadOnly = false } = req.query;

  const where = {
    userId: req.user.userId
  };

  if (unreadOnly === 'true') {
    where.isRead = false;
  }

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: {
      createdAt: 'desc'
    },
    take: parseInt(limit)
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId: req.user.userId,
      isRead: false
    }
  });

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount
    }
  });
});

export const markNotificationRead = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.userId !== req.user.userId) {
    throw new AppError('You do not have permission to modify this notification', 403);
  }

  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  res.json({
    success: true,
    data: updatedNotification
  });
});

export const markAllNotificationsRead = catchAsync(async (req, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.user.userId,
      isRead: false
    },
    data: {
      isRead: true
    }
  });

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

export const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.userId !== req.user.userId) {
    throw new AppError('You do not have permission to delete this notification', 403);
  }

  await prisma.notification.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});
