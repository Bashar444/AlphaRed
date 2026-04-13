export declare class CreateSurveyDto {
    title: string;
    description?: string;
    targetResponses?: number;
    estimatedMinutes?: number;
    language?: string;
    welcomeMessage?: string;
    thankYouMessage?: string;
    progressBar?: boolean;
    randomizeQuestions?: boolean;
    allowAnonymous?: boolean;
    category?: string;
    tags?: string[];
    teamId?: string;
}
export declare class UpdateSurveyDto {
    title?: string;
    description?: string;
    targetResponses?: number;
    estimatedMinutes?: number;
    language?: string;
    welcomeMessage?: string;
    thankYouMessage?: string;
    progressBar?: boolean;
    randomizeQuestions?: boolean;
    allowAnonymous?: boolean;
    category?: string;
    tags?: string[];
    startsAt?: string;
    endsAt?: string;
}
export declare class CreateQuestionDto {
    type: string;
    text: string;
    description?: string;
    required?: boolean;
    options?: unknown;
    validation?: unknown;
    logic?: unknown;
    mediaUrl?: string;
}
export declare class UpdateQuestionsDto {
    questions: QuestionItemDto[];
}
export declare class QuestionItemDto {
    id?: string;
    order: number;
    type: string;
    text: string;
    description?: string;
    required?: boolean;
    options?: unknown;
    validation?: unknown;
    logic?: unknown;
    mediaUrl?: string;
}
export declare class LaunchSurveyDto {
    startsAt?: string;
    endsAt?: string;
}
