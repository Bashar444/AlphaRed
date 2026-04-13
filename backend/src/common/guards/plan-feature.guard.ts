import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PLAN_FEATURE_KEY } from '../decorators/plan-feature.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlanFeatureGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredFeature = this.reflector.get<string>(
            PLAN_FEATURE_KEY,
            context.getHandler(),
        );
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
            throw new ForbiddenException(
                'Active subscription required to access this feature',
            );
        }

        const features = subscription.plan.features as string[];
        if (!features.includes(requiredFeature)) {
            throw new ForbiddenException(
                `Upgrade your plan to access "${requiredFeature}"`,
            );
        }

        return true;
    }
}
