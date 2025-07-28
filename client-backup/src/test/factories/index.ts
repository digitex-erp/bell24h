import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { User, Company, Product, RFQ, Bid, RFQStatus, BidStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const userFactory = async (overrides: Partial<User> = {}) => {
    return prisma.user.create({
        data: {
            ...(overrides.createdAt && { createdAt: overrides.createdAt }),
            name: overrides.name || faker.name.fullName(),
            ...(overrides.id && { id: overrides.id }),
            email: overrides.email || faker.internet.email(),
            password: overrides.password || faker.internet.password(),
            role: overrides.role || '$Enums.Role.USER',
            ...(overrides.isEmailVerified !== undefined && { isEmailVerified: overrides.isEmailVerified }),
            ...(overrides.companyId && { companyId: overrides.companyId }),
            ...(overrides.updatedAt && { updatedAt: overrides.updatedAt }),
        },
    });
};

export const companyFactory = async (overrides: Partial<Company> = {}) => {
    return prisma.company.create({
        data: {
            name: overrides.name || faker.company.name(),
            industry: overrides.industry || faker.company.industry(),
            website: overrides.website || faker.internet.url(),
            isVerified: overrides.isVerified || false,
            gstNumber: overrides.gstNumber || faker.finance.account(),
            gstVerified: overrides.gstVerified || false,
            ...(overrides.createdAt && { createdAt: overrides.createdAt }),
            ...(overrides.id && { id: overrides.id }),
            ...(overrides.updatedAt && { updatedAt: overrides.updatedAt }),
            ...overrides,
        },
    });
};

export const productFactory = async (overrides: Partial<Product> = {}) => {
    return prisma.product.create({
        data: {
            ...(overrides.createdAt && { createdAt: overrides.createdAt }),
            name: overrides.name || faker.commerce.productName(),
            ...(overrides.id && { id: overrides.id }),
            ...(overrides.companyId && { companyId: overrides.companyId }),
            ...(overrides.updatedAt && { updatedAt: overrides.updatedAt }),
            description: overrides.description || faker.commerce.productDescription(),
            unit: overrides.unit || 'kg',
        },
    });
};

export const rfqFactory = async (overrides: Partial<RFQ> = {}) => {
    return prisma.rFQ.create({
        data: {
            status: overrides.status || RFQStatus.OPEN,
            ...(overrides.createdAt && { createdAt: overrides.createdAt }),
            ...(overrides.buyerId && { buyerId: overrides.buyerId }),
            ...(overrides.id && { id: overrides.id }),
            ...(overrides.companyId && { companyId: overrides.companyId }),
            ...(overrides.updatedAt && { updatedAt: overrides.updatedAt }),
            description: overrides.description || faker.commerce.productDescription(),
            title: overrides.title || faker.commerce.productName(),
            requiredQuantity: overrides.requiredQuantity || 100,
            dueDate: overrides.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
};

export const bidFactory = async (overrides: Partial<Bid> = {}) => {
    return prisma.bid.create({
        data: {
            price: overrides.price || faker.number.int({ min: 1000, max: 10000 }),
            deliveryTime: overrides.deliveryTime || faker.number.int({ min: 1, max: 30 }),
            description: overrides.description || faker.commerce.productDescription(),
            status: overrides.status || BidStatus.PENDING,
            ...(overrides.rfqId && { rfqId: overrides.rfqId }),
            ...(overrides.companyId && { companyId: overrides.companyId }),
            ...(overrides.userId && { userId: overrides.userId }),
        },
    });
};
