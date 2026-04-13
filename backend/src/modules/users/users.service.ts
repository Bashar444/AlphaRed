import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(params: {
        page?: number;
        limit?: number;
        role?: string;
        status?: string;
        search?: string;
    }) {
        const { page = 1, limit = 20, role, status, search } = params;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = {};
        if (role) where.role = role;
        if (status) where.status = status;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { organization: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    organization: true,
                    lastLoginAt: true,
                    createdAt: true,
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                phone: true,
                role: true,
                status: true,
                organization: true,
                designation: true,
                country: true,
                state: true,
                preferredLanguage: true,
                timezone: true,
                emailVerified: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                subscription: {
                    include: { plan: true },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async createStaffUser(data: {
        email: string;
        name: string;
        password: string;
        role: 'MANAGER' | 'AGENT';
    }) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        return this.prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                name: data.name,
                passwordHash,
                role: data.role,
                status: 'ACTIVE',
                emailVerified: new Date(),
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
    }

    async updateUser(id: string, data: Record<string, unknown>) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                organization: true,
            },
        });
    }
}
