import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get my notifications' })
    @ApiQuery({ name: 'unreadOnly', required: false })
    async findAll(
        @CurrentUser('sub') userId: string,
        @Query('unreadOnly') unreadOnly?: string,
    ) {
        return this.notificationsService.findByUser(userId, unreadOnly === 'true');
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count' })
    async unreadCount(@CurrentUser('sub') userId: string) {
        const count = await this.notificationsService.unreadCount(userId);
        return { count };
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    async markAsRead(
        @Param('id') id: string,
        @CurrentUser('sub') userId: string,
    ) {
        return this.notificationsService.markAsRead(id, userId);
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllRead(@CurrentUser('sub') userId: string) {
        return this.notificationsService.markAllRead(userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification' })
    async delete(
        @Param('id') id: string,
        @CurrentUser('sub') userId: string,
    ) {
        return this.notificationsService.delete(id, userId);
    }
}
