export declare class CreatePlanDto {
    name: string;
    slug: string;
    description?: string;
    priceInr: number;
    priceUsd: number;
    billingCycle?: string;
    maxSurveys: number;
    maxResponses: number;
    maxQuestions: number;
    maxTeamMembers: number;
    features: string[];
    supportLevel?: string;
    trialDays?: number;
    sortOrder?: number;
    isActive?: boolean;
    isFeatured?: boolean;
}
export declare class UpdatePlanDto {
    name?: string;
    description?: string;
    priceInr?: number;
    priceUsd?: number;
    maxSurveys?: number;
    maxResponses?: number;
    maxQuestions?: number;
    maxTeamMembers?: number;
    features?: string[];
    supportLevel?: string;
    trialDays?: number;
    sortOrder?: number;
    isActive?: boolean;
    isFeatured?: boolean;
}
