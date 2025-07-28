import { PrismaClient, Prisma } from '@prisma/client';
import { NotificationType } from '../types/notification';

const prisma = new PrismaClient();

// Define types based on Prisma model
type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
};

type Company = {
  id: string;
  name: string;
};

type RFQ = {
  id: string;
  title: string;
  description: string | null;
  requiredQuantity: number;
  dueDate: Date;
  status: string;
  buyerId: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Bid = {
  id: string;
  price: number;
  deliveryTime: number;
  description: string | null;
  status: string;
  rfqId: string;
  companyId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type RFQWithRelations = RFQ & {
  bids: Bid[];
  buyer: User;
  company: Company;
};

type BidWithRelations = Bid & {
  rfq: RFQ;
  company: Company;
  user: User;
};

type Notification = {
  id: string;
  userId: string;
  type: string;
  message: string;
  rfqId: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class NotificationService {
  static async createNotification(userId: string, type: NotificationType, message: string, rfqId?: string) {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        rfqId,
      },
    });
  }

  static async getNotifications(userId: string, page: number = 1, limit: number = 10) {
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
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  static async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  }

  static async createRFQNotification(rfq: RFQWithRelations, action: 'CREATE' | 'UPDATE' | 'BID') {
    const notifications = [];

    // Notify RFQ creator about new bids
    if (action === 'BID') {
      notifications.push(
        prisma.notification.create({
          data: {
            userId: rfq.buyerId,
            type: 'BID_RECEIVED',
            message: `New bid received for RFQ: ${rfq.title}`,
            rfqId: rfq.id,
          },
        })
      );
    }

    // Notify company about RFQ updates
    if (action === 'UPDATE') {
      const companyUsers = await prisma.user.findMany({
        where: { companyId: rfq.companyId },
      });

      for (const user of companyUsers) {
        notifications.push(
          prisma.notification.create({
            data: {
              userId: user.id,
              type: 'RFQ_UPDATED',
              message: `RFQ ${rfq.title} has been updated`,
              rfqId: rfq.id,
            },
          })
        );
      }
    }

    return Promise.all(notifications);
  }

  static async createBidNotification(bid: BidWithRelations, rfq: RFQWithRelations) {
    return prisma.notification.create({
      data: {
        userId: rfq.buyerId,
        type: 'BID_RECEIVED',
        message: `New bid received for RFQ: ${rfq.title}`,
        rfqId: rfq.id,
      },
    });
  }

  static async createBidStatusNotification(bid: BidWithRelations, status: string) {
    const rfq = await prisma.rfq.findUnique({
      where: { id: bid.rfqId },
      include: { buyer: true },
    });

    if (!rfq) return;

    return prisma.notification.create({
      data: {
        userId: bid.userId,
        type: `BID_${status}` as NotificationType,
        message: `Your bid for RFQ ${rfq.title} has been ${status.toLowerCase()}`,
        rfqId: rfq.id,
      },
    });
  }
}
