import { Module } from '@nestjs/common';
import { ApiAccessRequestsController } from './api-access-requests.controller';
import { ApiAccessRequestsService } from './api-access-requests.service';

@Module({
    controllers: [ApiAccessRequestsController],
    providers: [ApiAccessRequestsService],
    exports: [ApiAccessRequestsService],
})
export class ApiAccessRequestsModule { }
