import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('templates')
@Controller('templates')
export class TemplatesController {
    constructor(private templatesService: TemplatesService) {}

    @Get()
    list(@Query('category') category?: string) {
        return this.templatesService.list(category);
    }

    @Get('categories')
    categories() {
        return this.templatesService.categories();
    }

    @Get(':id')
    get(@Param('id') id: string) {
        return this.templatesService.getById(id);
    }

    @Post(':id/use')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    use(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.templatesService.instantiate(id, userId);
    }
}
