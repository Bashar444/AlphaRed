import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisProcessor } from './analysis.processor';
import { AiNarrativeService } from './ai-narrative.service';

@Module({
    imports: [
        BullModule.registerQueue({ name: 'analysis' }),
    ],
    controllers: [AnalysisController],
    providers: [AnalysisService, AnalysisProcessor, AiNarrativeService],
    exports: [AnalysisService],
})
export class AnalysisModule { }
