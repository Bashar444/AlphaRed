import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
    descriptiveStats,
    frequencyDistribution,
    chiSquareTest,
    pearsonCorrelation,
    DescriptiveResult,
    FrequencyItem,
} from '../../libs/statistics';
import { AiNarrativeService } from './ai-narrative.service';

interface QuestionAnalysisResult {
    questionId: string;
    questionText: string;
    questionType: string;
    responseCount: number;
    descriptive?: DescriptiveResult;
    frequency?: FrequencyItem[];
}

@Injectable()
export class AnalysisService {
    constructor(
        private prisma: PrismaService,
        private aiNarrative: AiNarrativeService,
    ) { }

    /** Trigger full analysis for a survey */
    async runAnalysis(surveyId: string, triggeredBy: string) {
        const survey = await this.prisma.survey.findUnique({
            where: { id: surveyId },
            include: {
                questions: { orderBy: { order: 'asc' } },
            },
        });
        if (!survey) throw new NotFoundException('Survey not found');

        if (survey.status !== 'ACTIVE' && survey.status !== 'COMPLETED') {
            throw new BadRequestException('Survey must be ACTIVE or COMPLETED to analyze');
        }

        // Create pending report
        const report = await this.prisma.analysisReport.create({
            data: {
                surveyId,
                status: 'RUNNING',
                triggeredBy,
            },
        });

        try {
            // Fetch all completed responses with answers
            const responses = await this.prisma.response.findMany({
                where: { surveyId, status: 'COMPLETED' },
                include: { answers: true },
            });

            // Overview
            const overview = {
                totalResponses: responses.length,
                targetResponses: survey.targetResponses,
                completionRate: survey.targetResponses > 0
                    ? (responses.length / survey.targetResponses) * 100
                    : 0,
                avgDurationSecs: responses.length > 0
                    ? responses.reduce((a, r) => a + (r.durationSecs || 0), 0) / responses.length
                    : 0,
            };

            // Per-question analysis
            const questionAnalysis: QuestionAnalysisResult[] = [];

            for (const question of survey.questions) {
                const answers = responses
                    .flatMap((r) => r.answers)
                    .filter((a) => a.questionId === question.id);

                const result: QuestionAnalysisResult = {
                    questionId: question.id,
                    questionText: question.text,
                    questionType: question.type,
                    responseCount: answers.length,
                };

                if (answers.length === 0) {
                    questionAnalysis.push(result);
                    continue;
                }

                const isNumeric = ['NUMBER', 'RATING', 'LIKERT', 'SLIDER', 'NET_PROMOTER'].includes(question.type);

                if (isNumeric) {
                    const numericValues = answers
                        .map((a) => {
                            const val = typeof a.value === 'object' && a.value !== null
                                ? (a.value as any).value ?? a.value
                                : a.value;
                            return parseFloat(String(val));
                        })
                        .filter((v) => !isNaN(v));

                    if (numericValues.length > 0) {
                        result.descriptive = descriptiveStats(numericValues);
                    }
                } else {
                    const stringValues = answers.map((a) => {
                        const val = typeof a.value === 'object' && a.value !== null
                            ? (a.value as any).value ?? JSON.stringify(a.value)
                            : String(a.value);
                        return val;
                    });
                    result.frequency = frequencyDistribution(stringValues);
                }

                questionAnalysis.push(result);
            }

            // Cross-tabulations for pairs of categorical questions (first 5 pairs max)
            const categoricalQs = questionAnalysis.filter((q) => q.frequency);
            const crossTabs: any[] = [];

            for (let i = 0; i < Math.min(categoricalQs.length, 5); i++) {
                for (let j = i + 1; j < Math.min(categoricalQs.length, 5); j++) {
                    const q1Answers = responses
                        .flatMap((r) => r.answers)
                        .filter((a) => a.questionId === categoricalQs[i].questionId);
                    const q2Answers = responses
                        .flatMap((r) => r.answers)
                        .filter((a) => a.questionId === categoricalQs[j].questionId);

                    // Only pair answers from same response
                    const paired: { v1: string; v2: string }[] = [];
                    for (const r of responses) {
                        const a1 = r.answers.find((a) => a.questionId === categoricalQs[i].questionId);
                        const a2 = r.answers.find((a) => a.questionId === categoricalQs[j].questionId);
                        if (a1 && a2) {
                            paired.push({
                                v1: String(typeof a1.value === 'object' ? (a1.value as any).value ?? '' : a1.value),
                                v2: String(typeof a2.value === 'object' ? (a2.value as any).value ?? '' : a2.value),
                            });
                        }
                    }

                    if (paired.length >= 5) {
                        const chiResult = chiSquareTest(
                            paired.map((p) => p.v1),
                            paired.map((p) => p.v2),
                        );
                        crossTabs.push({
                            question1: categoricalQs[i].questionText,
                            question2: categoricalQs[j].questionText,
                            ...chiResult,
                        });
                    }
                }
            }

            // Correlations for numeric question pairs
            const numericQs = questionAnalysis.filter((q) => q.descriptive);
            const correlations: any[] = [];

            for (let i = 0; i < Math.min(numericQs.length, 5); i++) {
                for (let j = i + 1; j < Math.min(numericQs.length, 5); j++) {
                    const paired: { v1: number; v2: number }[] = [];
                    for (const r of responses) {
                        const a1 = r.answers.find((a) => a.questionId === numericQs[i].questionId);
                        const a2 = r.answers.find((a) => a.questionId === numericQs[j].questionId);
                        if (a1 && a2) {
                            const n1 = parseFloat(String(typeof a1.value === 'object' ? (a1.value as any).value : a1.value));
                            const n2 = parseFloat(String(typeof a2.value === 'object' ? (a2.value as any).value : a2.value));
                            if (!isNaN(n1) && !isNaN(n2)) {
                                paired.push({ v1: n1, v2: n2 });
                            }
                        }
                    }

                    if (paired.length >= 3) {
                        const corrResult = pearsonCorrelation(
                            paired.map((p) => p.v1),
                            paired.map((p) => p.v2),
                        );
                        correlations.push({
                            question1: numericQs[i].questionText,
                            question2: numericQs[j].questionText,
                            ...corrResult,
                        });
                    }
                }
            }

            const results = {
                overview,
                questionAnalysis,
                crossTabs,
                correlations,
            };

            // Generate AI narrative
            let aiNarrative: string;
            try {
                aiNarrative = await this.aiNarrative.generateNarrative(
                    survey.title,
                    survey.description,
                    results,
                );
            } catch {
                aiNarrative = 'AI narrative generation failed. Please review the statistical results above.';
            }

            // Save completed report
            const completed = await this.prisma.analysisReport.update({
                where: { id: report.id },
                data: {
                    status: 'COMPLETED',
                    results: results as any,
                    aiNarrative,
                    completedAt: new Date(),
                },
            });

            return completed;
        } catch (error: any) {
            await this.prisma.analysisReport.update({
                where: { id: report.id },
                data: {
                    status: 'FAILED',
                    failedAt: new Date(),
                    errorMessage: error.message,
                },
            });
            throw error;
        }
    }

    /** Get all reports for a survey */
    async getReports(surveyId: string) {
        return this.prisma.analysisReport.findMany({
            where: { surveyId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /** Get a single report by ID */
    async getReport(id: string) {
        const report = await this.prisma.analysisReport.findUnique({ where: { id } });
        if (!report) throw new NotFoundException('Analysis report not found');
        return report;
    }
}
