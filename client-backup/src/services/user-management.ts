import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification';
import { NotificationType } from '../types/notification';

const prisma = new PrismaClient();

export class UserManagementService {
  static async createUser(data: any) {
    try {
      const user = await prisma.user.create({
        data: {
          ...data,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create notification for admin
      await NotificationService.createNotification(
        'admin', // Assuming there's an admin user with ID 'admin'
        NotificationType.SYSTEM,
        `New user registration pending approval: ${data.email}`
      );

      return user;
    } catch (error) {
      throw new Error('Failed to create user');
    }
  }

  static async updateUser(userId: string, data: any) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      // Create notification for user about update
      await NotificationService.createNotification(
        userId,
        NotificationType.SYSTEM,
        'Your account has been updated'
      );

      return user;
    } catch (error) {
      throw new Error('Failed to update user');
    }
  }

  static async approveUser(userId: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'ACTIVE',
          updatedAt: new Date(),
        },
      });

      // Create notification for user
      await NotificationService.createNotification(
        userId,
        NotificationType.SYSTEM,
        'Your account has been approved'
      );

      return user;
    } catch (error) {
      throw new Error('Failed to approve user');
    }
  }

  static async rejectUser(userId: string, reason: string) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          status: 'REJECTED',
          updatedAt: new Date(),
        },
      });

      // Create notification for user
      await NotificationService.createNotification(
        userId,
        NotificationType.SYSTEM,
        `Your account has been rejected: ${reason}`
      );

      return user;
    } catch (error) {
      throw new Error('Failed to reject user');
    }
  }

  static async getUserActivity(userId: string, limit: number = 10) {
    try {
      const activities = await prisma.$transaction([
        prisma.rfq.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        prisma.bid.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
      ]);

      return {
        rfqs: activities[0],
        bids: activities[1],
      };
    } catch (error) {
      throw new Error('Failed to fetch user activity');
    }
  }

  static async getUserStats(userId: string) {
    try {
      const [rfqCount, bidCount] = await prisma.$transaction([
        prisma.rfq.count({ where: { userId } }),
        prisma.bid.count({ where: { userId } }),
      ]);

      return {
        rfqCount,
        bidCount,
      };
    } catch (error) {
      throw new Error('Failed to fetch user statistics');
    }
  }
}
