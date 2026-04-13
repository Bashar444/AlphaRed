import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as Papa from 'papaparse';
import * as archiver from 'archiver';
import { PassThrough } from 'stream';

@Injectable()
export class ExportsService {
    constructor(private prisma: PrismaService) { }

    /** Create an export record and generate the file */
    async createExport(
        surveyId: string,
        userId: string,
        format: string,
        reportId?: string,
    ) {
        const survey = await this.prisma.survey.findUnique({
            where: { id: surveyId },
            include: {
                questions: { orderBy: { order: 'asc' } },
                responses: {
                    where: { status: 'COMPLETED' },
                    include: { answers: true },
                },
            },
        });
        if (!survey) throw new NotFoundException('Survey not found');

        let report: any = null;
        if (reportId) {
            report = await this.prisma.analysisReport.findUnique({ where: { id: reportId } });
        }

        // Create export record
        const exportRecord = await this.prisma.export.create({
            data: {
                surveyId,
                userId,
                format: format as any,
                reportId,
                status: 'PROCESSING',
                fileName: `${survey.title.replace(/[^a-zA-Z0-9]/g, '_')}_export.${format.toLowerCase()}`,
            },
        });

        try {
            let fileBuffer: Buffer;
            let mimeType: string;

            switch (format.toUpperCase()) {
                case 'CSV':
                    fileBuffer = this.generateCSV(survey);
                    mimeType = 'text/csv';
                    break;
                case 'XLS':
                    fileBuffer = await this.generateExcel(survey, report);
                    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                case 'JSON':
                    fileBuffer = this.generateJSON(survey, report);
                    mimeType = 'application/json';
                    break;
                case 'ZIP':
                    fileBuffer = await this.generateZIP(survey, report);
                    mimeType = 'application/zip';
                    break;
                case 'PDF':
                    fileBuffer = await this.generatePDF(survey, report);
                    mimeType = 'application/pdf';
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }

            // Update export record with file info
            await this.prisma.export.update({
                where: { id: exportRecord.id },
                data: {
                    status: 'READY',
                    fileSizeKb: fileBuffer.length / 1024,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                },
            });

            return {
                export: exportRecord,
                buffer: fileBuffer,
                mimeType,
                fileName: exportRecord.fileName,
            };
        } catch (error: any) {
            await this.prisma.export.update({
                where: { id: exportRecord.id },
                data: { status: 'FAILED' },
            });
            throw error;
        }
    }

    /** Get user exports */
    async getUserExports(userId: string) {
        return this.prisma.export.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    // ═══════════════════════════════════════════
    // GENERATORS
    // ═══════════════════════════════════════════

    private generateCSV(survey: any): Buffer {
        const headers = ['ResponseID', 'RespondentID', 'Status', 'DurationSecs', 'CompletedAt'];
        for (const q of survey.questions) {
            headers.push(q.text);
        }

        const rows = survey.responses.map((r: any) => {
            const row: any = {
                ResponseID: r.id,
                RespondentID: r.respondentId,
                Status: r.status,
                DurationSecs: r.durationSecs || '',
                CompletedAt: r.completedAt || '',
            };
            for (const q of survey.questions) {
                const answer = r.answers.find((a: any) => a.questionId === q.id);
                row[q.text] = answer
                    ? (typeof answer.value === 'object' ? JSON.stringify(answer.value) : String(answer.value))
                    : '';
            }
            return row;
        });

        const csv = Papa.unparse({ fields: headers, data: rows });
        return Buffer.from(csv, 'utf-8');
    }

    private async generateExcel(survey: any, report: any): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'PrimoData Analytics';
        workbook.created = new Date();

        // Sheet 1: Raw Responses
        const responsesSheet = workbook.addWorksheet('Responses');
        const headers = ['Response ID', 'Respondent ID', 'Status', 'Duration (s)', 'Completed At'];
        for (const q of survey.questions) {
            headers.push(q.text);
        }
        responsesSheet.addRow(headers);

        // Style header row
        const headerRow = responsesSheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2563EB' },
        };
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

        for (const r of survey.responses) {
            const row: any[] = [r.id, r.respondentId, r.status, r.durationSecs || '', r.completedAt || ''];
            for (const q of survey.questions) {
                const answer = r.answers.find((a: any) => a.questionId === q.id);
                row.push(answer
                    ? (typeof answer.value === 'object' ? JSON.stringify(answer.value) : String(answer.value))
                    : '');
            }
            responsesSheet.addRow(row);
        }

        // Auto-width columns
        responsesSheet.columns.forEach((col: any) => {
            col.width = 20;
        });

        // Sheet 2: Analysis (if report exists)
        if (report?.results) {
            const analysisSheet = workbook.addWorksheet('Analysis');
            const results = report.results as any;

            let rowIdx = 1;
            analysisSheet.getRow(rowIdx).values = ['Question Analysis'];
            analysisSheet.getRow(rowIdx).font = { bold: true, size: 14 };
            rowIdx += 2;

            if (results.questionAnalysis) {
                for (const qa of results.questionAnalysis) {
                    analysisSheet.getRow(rowIdx).values = [qa.questionText];
                    analysisSheet.getRow(rowIdx).font = { bold: true };
                    rowIdx++;

                    if (qa.descriptive) {
                        analysisSheet.getRow(rowIdx).values = ['Mean', 'Median', 'Std Dev', 'Min', 'Max', 'Count'];
                        analysisSheet.getRow(rowIdx).font = { bold: true };
                        rowIdx++;
                        analysisSheet.getRow(rowIdx).values = [
                            qa.descriptive.mean, qa.descriptive.median, qa.descriptive.stdDev,
                            qa.descriptive.min, qa.descriptive.max, qa.descriptive.count,
                        ];
                        rowIdx += 2;
                    }

                    if (qa.frequency) {
                        analysisSheet.getRow(rowIdx).values = ['Value', 'Count', 'Percentage'];
                        analysisSheet.getRow(rowIdx).font = { bold: true };
                        rowIdx++;
                        for (const f of qa.frequency) {
                            analysisSheet.getRow(rowIdx).values = [f.value, f.count, `${f.percentage}%`];
                            rowIdx++;
                        }
                        rowIdx++;
                    }
                }
            }

            analysisSheet.columns.forEach((col: any) => { col.width = 20; });
        }

        // Sheet 3: AI Narrative (if exists)
        if (report?.aiNarrative) {
            const narrativeSheet = workbook.addWorksheet('AI Narrative');
            narrativeSheet.getRow(1).values = ['AI-Generated Analysis Narrative'];
            narrativeSheet.getRow(1).font = { bold: true, size: 14 };
            narrativeSheet.getRow(3).values = [report.aiNarrative];
            narrativeSheet.getColumn(1).width = 100;
            narrativeSheet.getRow(3).alignment = { wrapText: true };
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    private generateJSON(survey: any, report: any): Buffer {
        const data = {
            survey: {
                id: survey.id,
                title: survey.title,
                description: survey.description,
                status: survey.status,
                questions: survey.questions.map((q: any) => ({
                    id: q.id,
                    text: q.text,
                    type: q.type,
                    order: q.order,
                })),
            },
            responses: survey.responses.map((r: any) => ({
                id: r.id,
                respondentId: r.respondentId,
                status: r.status,
                durationSecs: r.durationSecs,
                completedAt: r.completedAt,
                answers: r.answers.map((a: any) => ({
                    questionId: a.questionId,
                    value: a.value,
                })),
            })),
            analysis: report?.results || null,
            aiNarrative: report?.aiNarrative || null,
            exportedAt: new Date().toISOString(),
        };

        return Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
    }

    private async generateZIP(survey: any, report: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const passthrough = new PassThrough();
            const chunks: Buffer[] = [];
            passthrough.on('data', (chunk) => chunks.push(chunk));
            passthrough.on('end', () => resolve(Buffer.concat(chunks)));
            passthrough.on('error', reject);

            const archive = archiver.default('zip', { zlib: { level: 9 } });
            archive.pipe(passthrough);

            // Add CSV
            const csv = this.generateCSV(survey);
            archive.append(csv, { name: 'responses.csv' });

            // Add JSON
            const json = this.generateJSON(survey, report);
            archive.append(json, { name: 'full_data.json' });

            // Add narrative
            if (report?.aiNarrative) {
                archive.append(report.aiNarrative, { name: 'analysis_narrative.txt' });
            }

            // Add analysis results
            if (report?.results) {
                archive.append(JSON.stringify(report.results, null, 2), { name: 'analysis_results.json' });
            }

            archive.finalize();
        });
    }

    private async generatePDF(survey: any, report: any): Promise<Buffer> {
        // Use pdfmake for PDF generation
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfMake = require('pdfmake/build/pdfmake');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfFonts = require('pdfmake/build/vfs_fonts');
        pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.default?.pdfMake?.vfs;

        const content: any[] = [
            { text: survey.title, style: 'header' },
            { text: `Export Date: ${new Date().toISOString().split('T')[0]}`, style: 'subheader' },
            { text: '\n' },
        ];

        if (survey.description) {
            content.push({ text: survey.description, margin: [0, 0, 0, 10] });
        }

        // Overview
        content.push({ text: 'Survey Overview', style: 'sectionHeader' });
        content.push({
            table: {
                widths: ['*', '*'],
                body: [
                    ['Total Responses', String(survey.responses.length)],
                    ['Target Responses', String(survey.targetResponses)],
                    ['Status', survey.status],
                    ['Questions', String(survey.questions.length)],
                ],
            },
            margin: [0, 5, 0, 15],
        });

        // Analysis results
        if (report?.results?.questionAnalysis) {
            content.push({ text: 'Question Analysis', style: 'sectionHeader' });

            for (const qa of report.results.questionAnalysis) {
                content.push({ text: qa.questionText, style: 'questionHeader' });

                if (qa.descriptive) {
                    content.push({
                        table: {
                            widths: ['*', '*', '*', '*', '*', '*'],
                            body: [
                                ['Mean', 'Median', 'Std Dev', 'Min', 'Max', 'N'],
                                [
                                    String(qa.descriptive.mean),
                                    String(qa.descriptive.median),
                                    String(qa.descriptive.stdDev),
                                    String(qa.descriptive.min),
                                    String(qa.descriptive.max),
                                    String(qa.descriptive.count),
                                ],
                            ],
                        },
                        margin: [0, 5, 0, 10],
                    });
                }

                if (qa.frequency && qa.frequency.length > 0) {
                    const freqBody = [['Value', 'Count', 'Percentage']];
                    for (const f of qa.frequency.slice(0, 10)) {
                        freqBody.push([f.value, String(f.count), `${f.percentage}%`]);
                    }
                    content.push({
                        table: { widths: ['*', 'auto', 'auto'], body: freqBody },
                        margin: [0, 5, 0, 10],
                    });
                }
            }
        }

        // AI Narrative
        if (report?.aiNarrative) {
            content.push({ text: 'AI-Generated Insights', style: 'sectionHeader' });
            content.push({ text: report.aiNarrative, margin: [0, 5, 0, 15] });
        }

        const docDefinition: any = {
            content,
            styles: {
                header: { fontSize: 20, bold: true, margin: [0, 0, 0, 5] },
                subheader: { fontSize: 12, color: '#666666' },
                sectionHeader: { fontSize: 16, bold: true, margin: [0, 15, 0, 5], color: '#2563EB' },
                questionHeader: { fontSize: 12, bold: true, margin: [0, 10, 0, 3] },
            },
            defaultStyle: { fontSize: 10 },
            footer: (currentPage: number, pageCount: number) => ({
                text: `PrimoData Analytics — Page ${currentPage} of ${pageCount}`,
                alignment: 'center',
                fontSize: 8,
                color: '#999999',
            }),
        };

        return new Promise<Buffer>((resolve, reject) => {
            try {
                const printer = pdfMake.createPdf(docDefinition);
                printer.getBuffer((buffer: Buffer) => {
                    resolve(buffer);
                });
            } catch (err) {
                reject(err);
            }
        });
    }
}
