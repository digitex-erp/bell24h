import { authOptions } from '@/lib/auth';
import logger from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { PaymentGateway, TransactionStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Type for escrow hold with relations
type EscrowHoldWithRelations = {
  id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  referenceId: string;
  orderId: string | null;
  releaseDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  buyer: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  seller: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  wallet: {
    id: string;
    currency: string;
    gateway: PaymentGateway;
  };
  transactions: Array<{
    id: string;
    status: TransactionStatus;
    referenceId: string;
    createdAt: Date;
  }>;
};

// Type for API response
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// Schema for GET request query parameters
const getEscrowQuerySchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .refine((n) => n > 0, 'Page must be positive'),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .refine((n) => n > 0 && n <= 100, 'Limit must be between 1 and 100'),
  sortBy: z
    .enum(['createdAt', 'amount', 'releaseDate'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// Schema for creating an escrow hold
const createEscrowSchema = z.object({
  action: z.literal('create'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(3).default('INR'),
  gateway: z.nativeEnum(PaymentGateway),
  buyerId: z.string().min(1, 'Buyer ID is required'),
  sellerId: z.string().min(1, 'Seller ID is required'),
  orderId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  releaseDate: z.string().datetime().optional(),
});

// Schema for releasing an escrow hold
const releaseEscrowSchema = z.object({
  action: z.literal('release'),
  escrowHoldId: z.string().min(1, 'Escrow hold ID is required'),
  metadata: z.record(z.any()).optional(),
});

const refundEscrowSchema = z.object({
  action: z.literal('refund'),
  escrowHoldId: z.string().min(1, 'Escrow hold ID is required'),
  reason: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const toggleEscrowSchema = z.object({
  action: z.literal('toggle'),
  isEnabled: z.boolean(),
});

const requestSchema = z.discriminatedUnion('action', [
  createEscrowSchema,
  releaseEscrowSchema,
  refundEscrowSchema,
  toggleEscrowSchema,
]);

// Handler for GET /api/escrow - List escrow holds with filtering and pagination
export async function GET(
  req: Request
): Promise<NextResponse<ApiResponse<EscrowHoldWithRelations[]>>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requestData = await req.json();
    const validation = getEscrowQuerySchema.safeParse(requestData);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { status, page, limit, sortBy, sortOrder, search, fromDate, toDate } =
      validation.data;

    // Build where clause with proper TypeScript types
    const where: any = {};
    // Date range filter
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (fromDate) dateFilter.gte = new Date(fromDate);
    if (toDate) dateFilter.lte = new Date(toDate);
    if (Object.keys(dateFilter).length > 0) {
      where.createdAt = dateFilter;
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Continue building where clause
    Object.assign(where, {
      walletId: wallet.id,
      ...(status && { status }),
      ...(search && {
        OR: [
          { referenceId: { contains: search, mode: 'insensitive' as const } },
          { orderId: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    });

    try {
      // Get escrow holds with pagination and related data
      const [escrowHolds, total] = await Promise.all([
        prisma.escrowHold.findMany({
          where,
          include: {
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            wallet: {
              select: {
                id: true,
                currency: true,
                gateway: true,
              },
            },
            transactions: {
              orderBy: { createdAt: 'desc' as const },
              take: 1,
              select: {
                id: true,
                status: true,
                referenceId: true,
                createdAt: true,
              },
            },
          },
          orderBy: { [sortBy]: sortOrder } as const, // Type assertion for dynamic orderBy
          skip: (page - 1) * limit,
          take: limit,
        }) as Promise<EscrowHoldWithRelations[]>,
        prisma.escrowHold.count({ where }),
      ]);

      // Format response data
      const formattedHolds = escrowHolds.map(
        (hold: EscrowHoldWithRelations) => ({
          id: hold.id,
          amount: hold.amount,
          currency: hold.currency,
          status: hold.status,
          referenceId: hold.referenceId,
          orderId: hold.orderId,
          releaseDate: hold.releaseDate,
          createdAt: hold.createdAt,
          updatedAt: hold.updatedAt,
          buyer: hold.buyer,
          seller: hold.seller,
          wallet: hold.wallet,
          latestTransaction: hold.transactions[0],
        })
      );

      return NextResponse.json({
        success: true,
        data: formattedHolds,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error('Error fetching escrow holds:', {
        error,
        userId: session.user.id,
        query: {
          status,
          page,
          limit,
          sortBy,
          sortOrder,
          search,
          fromDate,
          toDate,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch escrow holds',
          ...(process.env.NODE_ENV === 'development' && {
            details: error instanceof Error ? error.message : String(error),
          }),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Unhandled error in GET /api/escrow', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
