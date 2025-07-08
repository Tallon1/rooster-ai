import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { Notification, NotificationType } from '@rooster-ai/shared';

const prisma = new PrismaClient();

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter - Fix: use createTransport instead of createTransporter
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    data?: Record<string, any>
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: data || {},
        isRead: false,
      },
    });

    // Send real-time notification via WebSocket
    await this.sendRealTimeNotification(userId, notification);

    return notification;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    return notification;
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return result;
  }

  async sendRosterPublishedNotifications(rosterId: string) {
    const roster = await prisma.roster.findUnique({
      where: { id: rosterId },
      include: {
        shifts: {
          include: {
            staff: {
              include: {
                tenant: true,
              },
            },
          },
        },
        tenant: true,
      },
    });

    if (!roster) {
      throw new Error('Roster not found');
    }

    // Get all users in the tenant who should be notified
    const tenantUsers = await prisma.user.findMany({
      where: {
        tenantId: roster.tenantId,
        isActive: true,
      },
    });

    // Create notifications for all staff members in shifts
    const staffInRoster = roster.shifts.map(shift => shift.staff);
    const uniqueStaff = Array.from(new Set(staffInRoster.map(s => s.id)))
      .map(id => staffInRoster.find(s => s.id === id)!);

    for (const staff of uniqueStaff) {
      // Find corresponding user account
      const user = tenantUsers.find(u => u.email === staff.email);
      if (user) {
        await this.createNotification(
          user.id,
          'New Roster Published',
          `Your schedule for ${roster.name} has been published.`,
          'roster_published',
          {
            rosterId: roster.id,
            rosterName: roster.name,
            startDate: roster.startDate,
            endDate: roster.endDate,
          }
        );

        // Send email notification
        await this.sendEmailNotification(
          user.email,
          user.name,
          'New Roster Published',
          this.generateRosterEmailTemplate(roster, user)
        );
      }
    }
  }

  async sendShiftChangeNotifications(shiftId: string, changeType: 'created' | 'updated' | 'deleted') {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        staff: true,
        roster: {
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!shift) {
      throw new Error('Shift not found');
    }

    // Find user account for the staff member
    const user = await prisma.user.findFirst({
      where: {
        email: shift.staff.email,
        tenantId: shift.roster.tenantId,
      },
    });

    if (user) {
      const messages = {
        created: `You have been assigned a new shift on ${shift.startTime.toLocaleDateString()}.`,
        updated: `Your shift on ${shift.startTime.toLocaleDateString()} has been updated.`,
        deleted: `Your shift on ${shift.startTime.toLocaleDateString()} has been cancelled.`,
      };

      await this.createNotification(
        user.id,
        'Shift Update',
        messages[changeType],
        'shift_changed',
        {
          shiftId: shift.id,
          rosterId: shift.rosterId,
          startTime: shift.startTime,
          endTime: shift.endTime,
          position: shift.position,
        }
      );

      // Send email notification for significant changes
      if (changeType === 'created' || changeType === 'deleted') {
        await this.sendEmailNotification(
          user.email,
          shift.staff.name,
          'Shift Update',
          this.generateShiftEmailTemplate(shift, changeType)
        );
      }
    }
  }

  private async sendEmailNotification(
    email: string,
    name: string,
    subject: string,
    htmlContent: string
  ) {
    try {
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@rooster-ai.com',
        to: email,
        subject: `${subject} - Rooster AI`,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private async sendRealTimeNotification(userId: string, notification: any) {
    // This will be implemented with WebSocket in the next step
    // For now, we'll just log it
    console.log(`Real-time notification for user ${userId}:`, notification);
  }

  private generateRosterEmailTemplate(roster: any, user: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🗓️ New Roster Published</h1>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Your schedule for <strong>${roster.name}</strong> has been published and is now available to view.</p>
            <p><strong>Schedule Period:</strong><br>
            ${roster.startDate.toLocaleDateString()} - ${roster.endDate.toLocaleDateString()}</p>
            <p>Please log in to your Rooster AI account to view your complete schedule and shift details.</p>
            <a href="${process.env.FRONTEND_URL}/roster/${roster.id}" class="btn">View Schedule</a>
          </div>
          <div class="footer">
            <p>This is an automated message from Rooster AI. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateShiftEmailTemplate(shift: any, changeType: 'created' | 'updated' | 'deleted'): string {
    // Fix: Add proper type annotation and index signature
    const actionText: Record<'created' | 'updated' | 'deleted', string> = {
      created: 'assigned to',
      updated: 'updated for',
      deleted: 'cancelled for',
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .shift-details { background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Shift Update</h1>
          </div>
          <div class="content">
            <p>Hi ${shift.staff.name},</p>
            <p>You have been ${actionText[changeType]} a shift:</p>
            <div class="shift-details">
              <p><strong>Date:</strong> ${shift.startTime.toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${shift.startTime.toLocaleTimeString()} - ${shift.endTime.toLocaleTimeString()}</p>
              <p><strong>Position:</strong> ${shift.position}</p>
              ${shift.notes ? `<p><strong>Notes:</strong> ${shift.notes}</p>` : ''}
            </div>
            <p>Please log in to your account for more details.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
