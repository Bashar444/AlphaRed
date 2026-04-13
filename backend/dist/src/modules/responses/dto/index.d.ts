export declare class SubmitResponseDto {
    surveyId: string;
    respondentId: string;
    answers: AnswerItemDto[];
    durationSecs?: number;
}
export declare class AnswerItemDto {
    questionId: string;
    value: unknown;
}
