import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiAccessRequestsService } from './api-access-requests.service';
import { CreateApiAccessRequestDto, ReviewApiAccessRequestDto } from './dto';

@ApiTags('API Access Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/api-access-requests')
export class ApiAccessRequestsController {
    constructor(private readonly service: ApiAccessRequestsService) { }

    @Post()
    @ApiOperation({ summary: 'Submit an API access request' })
    create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateApiAccessRequestDto,
    ) {
        return this.service.create(userId, dto);
    }

    @Get('mine')
    @ApiOperation({ summary: 'List my API access requests' })
    listMine(@CurrentUser('id') userId: string) {
        return this.service.listMine(userId);
    }

    @Get()
    @ApiOperation({ summary: 'Admin: list all API access requests' })
    listAll(
        @CurrentUser('role') role: string,
        @Query('status') status?: string,
    ) {
        // Soft role check (proper RolesGuard can be added later)
        if (role !== 'SUPERADMIN' && role !== 'MANAGER') {
            return [];
        }
        return this.service.listAll(status);
    }

    @Patch(':id/review')
    @ApiOperation({ summary: 'Admin: approve or reject an API access request' })
    review(
        @CurrentUser('id') reviewerId: string,
        @CurrentUser('role') role: string,
        @Param('id') id: string,
        @Body() dto: ReviewApiAccessRequestDto,
    ) {
        if (role !== 'SUPERADMIN' && role !== 'MANAGER') {
            throw new Error('Forbidden');
        }
        return this.service.review(id, reviewerId, dto);
    }
}
