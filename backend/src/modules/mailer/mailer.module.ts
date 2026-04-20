import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
    imports: [ConfigModule, PrismaModule],
    providers: [MailerService],
    exports: [MailerService],
})
export class MailerModule { }
