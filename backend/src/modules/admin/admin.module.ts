import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController, CmsController } from './admin.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
    imports: [PrismaModule, MailerModule],
    controllers: [AdminController, CmsController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
