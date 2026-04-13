import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Injectable()
@Processor('analysis')
export class AnalysisProcessor extends WorkerHost {
    constructor(private analysisService: AnalysisService) {
        super();
    }

    async process(job: Job<{ surveyId: string; triggeredBy: string }>) {
        const { surveyId, triggeredBy } = job.data;
        return this.analysisService.runAnalysis(surveyId, triggeredBy);
    }
}
