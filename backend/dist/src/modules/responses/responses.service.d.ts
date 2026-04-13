import { PrismaService } from '../../prisma/prisma.service';
import { SubmitResponseDto } from './dto';
export declare class ResponsesService {
    private prisma;
    constructor(prisma: PrismaService);
    submit(dto: SubmitResponseDto, ipHash?: string, userAgent?: string): Promise<{
        responseId: string;
        status: string;
    }>;
    findBySurvey(surveyId: string, params: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        responses: ({
            respondent: {
                id: string;
                name: string | null;
                email: string | null;
                qualityScore: number;
            };
            answers: {
                id: string;
                createdAt: Date;
                value: import("@prisma/client/runtime/client").JsonValue;
                questionId: string;
                responseId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            status: import("@prisma/client").$Enums.ResponseStatus;
            completedAt: Date | null;
            surveyId: string;
            durationSecs: number | null;
            qualityScore: number | null;
            respondentId: string;
            qualityFlags: import("@prisma/client/runtime/client").JsonValue | null;
            ipHash: string | null;
            deviceHash: string | null;
            userAgent: string | null;
        })[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(id: string): Promise<{
        survey: {
            id: string;
            userId: string;
            title: string;
        };
        respondent: {
            id: string;
            name: string | null;
            email: string | null;
            qualityScore: number;
        };
        answers: ({
            question: {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                required: boolean;
                type: import("@prisma/client").$Enums.QuestionType;
                text: string;
                options: import("@prisma/client/runtime/client").JsonValue | null;
                validation: import("@prisma/client/runtime/client").JsonValue | null;
                logic: import("@prisma/client/runtime/client").JsonValue | null;
                mediaUrl: string | null;
                order: number;
                surveyId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            value: import("@prisma/client/runtime/client").JsonValue;
            questionId: string;
            responseId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ResponseStatus;
        completedAt: Date | null;
        surveyId: string;
        durationSecs: number | null;
        qualityScore: number | null;
        respondentId: string;
        qualityFlags: import("@prisma/client/runtime/client").JsonValue | null;
        ipHash: string | null;
        deviceHash: string | null;
        userAgent: string | null;
    }>;
    flagResponse(id: string, flags: unknown): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ResponseStatus;
        completedAt: Date | null;
        surveyId: string;
        durationSecs: number | null;
        qualityScore: number | null;
        respondentId: string;
        qualityFlags: import("@prisma/client/runtime/client").JsonValue | null;
        ipHash: string | null;
        deviceHash: string | null;
        userAgent: string | null;
    }>;
    rejectResponse(id: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/client").$Enums.ResponseStatus;
        completedAt: Date | null;
        surveyId: string;
        durationSecs: number | null;
        qualityScore: number | null;
        respondentId: string;
        qualityFlags: import("@prisma/client/runtime/client").JsonValue | null;
        ipHash: string | null;
        deviceHash: string | null;
        userAgent: string | null;
    }>;
}
