"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PlansService = class PlansService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(includeInactive = false) {
        const where = includeInactive ? {} : { isActive: true };
        return this.prisma.plan.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
    }
    async findBySlug(slug) {
        const plan = await this.prisma.plan.findUnique({ where: { slug } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return plan;
    }
    async findById(id) {
        const plan = await this.prisma.plan.findUnique({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return plan;
    }
    async create(dto) {
        const existing = await this.prisma.plan.findUnique({ where: { slug: dto.slug } });
        if (existing)
            throw new common_1.ConflictException('Plan slug already exists');
        return this.prisma.plan.create({ data: dto });
    }
    async update(id, dto) {
        await this.findById(id);
        return this.prisma.plan.update({ where: { id }, data: dto });
    }
    async toggleActive(id) {
        const plan = await this.findById(id);
        return this.prisma.plan.update({
            where: { id },
            data: { isActive: !plan.isActive },
        });
    }
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlansService);
//# sourceMappingURL=plans.service.js.map