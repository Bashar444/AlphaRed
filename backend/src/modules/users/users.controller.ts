import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'List all users (admin/manager)' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'role', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'search', required: false })
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('role') role?: string,
        @Query('status') status?: string,
        @Query('search') search?: string,
    ) {
        return this.usersService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            role,
            status,
            search,
        });
    }

    @Get(':id')
    @Roles('SUPERADMIN', 'MANAGER')
    @ApiOperation({ summary: 'Get user by ID' })
    async findById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Post('staff')
    @Roles('SUPERADMIN')
    @ApiOperation({ summary: 'Create staff user (manager/agent)' })
    async createStaff(
        @Body() body: { email: string; name: string; password: string; role: 'MANAGER' | 'AGENT' },
    ) {
        return this.usersService.createStaffUser(body);
    }

    @Put(':id/status')
    @Roles('SUPERADMIN')
    @ApiOperation({ summary: 'Update user status' })
    async updateStatus(
        @Param('id') id: string,
        @Body() body: { status: string },
    ) {
        return this.usersService.updateUser(id, { status: body.status });
    }

    @Put(':id/role')
    @Roles('SUPERADMIN')
    @ApiOperation({ summary: 'Update user role' })
    async updateRole(
        @Param('id') id: string,
        @Body() body: { role: string },
    ) {
        return this.usersService.updateUser(id, { role: body.role });
    }
}
