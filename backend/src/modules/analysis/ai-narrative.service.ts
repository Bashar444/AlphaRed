import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiNarrativeService {
    private client: Anthropic | null = null;

    constructor(private config: ConfigService) {
        const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
        if (apiKey) {
            this.client = new Anthropic({ apiKey });
        }
    }

    async generateNarrative(
        surveyTitle: string,
        surveyDescription: string | null,
        analysisResults: any,
    ): Promise<string> {
        if (!this.client) {
            return this.generateFallbackNarrative(surveyTitle, analysisResults);
        }

        const prompt = `You are a research data analyst. Analyze the following survey results and write a professional narrative summary suitable for a research report.

Survey: "${surveyTitle}"
${surveyDescription ? `Description: "${surveyDescription}"` : ''}

Statistical Analysis Results:
${JSON.stringify(analysisResults, null, 2)}

Write a clear, professional narrative (3-5 paragraphs) that:
1. Summarizes key findings
2. Highlights statistically significant results
3. Notes patterns and trends in the data
4. Provides actionable insights
5. Uses simple language accessible to non-statisticians

Do NOT include raw numbers in isolation — always provide context.`;

        const message = await this.client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{ role: 'user', content: prompt }],
        });

        const textBlock = message.content.find((b: any) => b.type === 'text');
        return textBlock ? textBlock.text : this.generateFallbackNarrative(surveyTitle, analysisResults);
    }

    private generateFallbackNarrative(surveyTitle: string, results: any): string {
        const parts: string[] = [];
        parts.push(`Analysis Report for "${surveyTitle}"`);
        parts.push('');

        if (results.overview) {
            parts.push(`This survey collected ${results.overview.totalResponses} responses out of a target of ${results.overview.targetResponses}. The completion rate was ${results.overview.completionRate?.toFixed(1)}%.`);
            parts.push('');
        }

        if (results.questionAnalysis && results.questionAnalysis.length > 0) {
            parts.push(`The survey contained ${results.questionAnalysis.length} questions. Below is a summary of each question's results.`);
            parts.push('');

            for (const qa of results.questionAnalysis) {
                if (qa.descriptive) {
                    parts.push(`Question "${qa.questionText}": The average response was ${qa.descriptive.mean} (SD = ${qa.descriptive.stdDev}), ranging from ${qa.descriptive.min} to ${qa.descriptive.max}.`);
                } else if (qa.frequency && qa.frequency.length > 0) {
                    const top = qa.frequency[0];
                    parts.push(`Question "${qa.questionText}": The most common response was "${top.value}" (${top.percentage}%).`);
                }
            }
        }

        parts.push('');
        parts.push('Note: AI-powered narrative generation is available when the Anthropic API key is configured.');

        return parts.join('\n');
    }
}
