import { Module } from '@nestjs/common';
import { RespondentsService } from './respondents.service';
import { RespondentsController } from './respondents.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [RespondentsController],
    providers: [RespondentsService],
    exports: [RespondentsService],
})
export class RespondentsModule { }
