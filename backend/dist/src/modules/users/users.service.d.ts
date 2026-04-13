import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(params: {
        page?: number;
        limit?: number;
        role?: string;
        status?: string;
        search?: string;
    }): Promise<{
        users: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
            status: import("@prisma/client").$Enums.UserStatus;
            organization: string | null;
            lastLoginAt: Date | null;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        avatarUrl: string | null;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        emailVerified: Date | null;
        organization: string | null;
        designation: string | null;
        country: string | null;
        state: string | null;
        preferredLanguage: string;
        timezone: string;
        lastLoginAt: Date | null;
        subscription: ({
            plan: {
                id: string;
                name: string;
                slug: string;
                description: string | null;
                priceInr: number;
                priceUsd: number;
                billingCycle: import("@prisma/client").$Enums.BillingCycle;
                isActive: boolean;
                isFeatured: boolean;
                sortOrder: number;
                trialDays: number;
                maxSurveys: number;
                maxResponses: number;
                maxQuestions: number;
                maxTeamMembers: number;
                features: import("@prisma/client/runtime/client").JsonValue;
                supportLevel: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            billingCycle: import("@prisma/client").$Enums.BillingCycle;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SubscriptionStatus;
            userId: string;
            planId: string;
            currentPeriodStart: Date | null;
            currentPeriodEnd: Date | null;
            trialEndsAt: Date | null;
            cancelAtPeriodEnd: boolean;
            cancelledAt: Date | null;
            approvedBy: string | null;
            approvedAt: Date | null;
            razorpaySubId: string | null;
            razorpayCustomerId: string | null;
            stripeSubId: string | null;
            stripeCustomerId: string | null;
            discountCode: string | null;
            discountPercent: number | null;
        }) | null;
    }>;
    createStaffUser(data: {
        email: string;
        name: string;
        password: string;
        role: 'MANAGER' | 'AGENT';
    }): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
    }>;
    updateUser(id: string, data: Record<string, unknown>): Promise<{
        id: string;
        name: string;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        status: import("@prisma/client").$Enums.UserStatus;
        organization: string | null;
    }>;
}
