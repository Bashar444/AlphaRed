import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController, CmsController } from './admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AdminController, CmsController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
