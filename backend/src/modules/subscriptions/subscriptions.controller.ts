import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto, ApproveSubscriptionDto, RejectSubscriptionDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('api/v1/subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @Get('me')
    @ApiOperation({ summary: 'Get my subscription' })
    async mySubscription(@CurrentUser('id') userId: string) {
        return this.subscriptionsService.getUserSubscription(userId);
    }

    @Get('me/usage')
    @ApiOperation({ summary: 'Get my plan usage vs limits (surveys, responses, questions)' })
    async myUsage(@CurrentUser('id') userId: string) {
        return this.subscriptionsService.getUsage(userId);
    }

    @Post('subscribe')
    @ApiOperation({ summary: 'Subscribe to a plan' })
    async subscribe(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateSubscriptionDto,
    ) {
        return this.subscriptionsService.subscribe(userId, dto);
    }

    @Post('cancel')
    @ApiOperation({ summary: 'Cancel subscription' })
    async cancel(@CurrentUser('id') userId: string) {
        return this.subscriptionsService.cancel(userId);
    }

    @Get('pending')
    @UseGuards(RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'List pending subscriptions (admin)' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async listPending(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.subscriptionsService.listPending(
            page ? parseInt(page, 10) : undefined,
            limit ? parseInt(limit, 10) : undefined,
        );
    }

    @Post('approve')
    @UseGuards(RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Approve a subscription (admin)' })
    async approve(
        @CurrentUser('id') adminId: string,
        @Body() dto: ApproveSubscriptionDto,
    ) {
        return this.subscriptionsService.approve(dto.subscriptionId, adminId);
    }

    @Post('reject')
    @UseGuards(RolesGuard)
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Reject a subscription (admin)' })
    async reject(@Body() dto: RejectSubscriptionDto) {
        return this.subscriptionsService.reject(dto.subscriptionId);
    }
}
