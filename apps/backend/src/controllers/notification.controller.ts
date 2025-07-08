import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { ApiResponse } from '@rooster-ai/shared';

const notificationService = new NotificationService();

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getUserNotifications(userId, page, limit);

    const response: ApiResponse = {
      success: true,
      data: result.data,
      pagination: result.pagination
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch notifications'
    };

    res.status(500).json(response);
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await notificationService.markAsRead(id, userId);

    const response: ApiResponse = {
      success: true,
      message: 'Notification marked as read'
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to mark notification as read'
    };

    res.status(400).json(response);
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    await notificationService.markAllAsRead(userId);

    const response: ApiResponse = {
      success: true,
      message: 'All notifications marked as read'
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to mark all notifications as read'
    };

    res.status(400).json(response);
  }
};
