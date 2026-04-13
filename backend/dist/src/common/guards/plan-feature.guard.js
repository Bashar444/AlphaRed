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
exports.PlanFeatureGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const plan_feature_decorator_1 = require("../decorators/plan-feature.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
let PlanFeatureGuard = class PlanFeatureGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const requiredFeature = this.reflector.get(plan_feature_decorator_1.PLAN_FEATURE_KEY, context.getHandler());
        if (!requiredFeature) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user) {
            return false;
        }
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId: user.id },
            include: { plan: true },
        });
        if (!subscription || subscription.status !== 'ACTIVE') {
            throw new common_1.ForbiddenException('Active subscription required to access this feature');
        }
        const features = subscription.plan.features;
        if (!features.includes(requiredFeature)) {
            throw new common_1.ForbiddenException(`Upgrade your plan to access "${requiredFeature}"`);
        }
        return true;
    }
};
exports.PlanFeatureGuard = PlanFeatureGuard;
exports.PlanFeatureGuard = PlanFeatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], PlanFeatureGuard);
//# sourceMappingURL=plan-feature.guard.js.map